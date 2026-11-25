// Compute nodes and AWS accounts, in the user's own scope: no workspace and
// no organization_id anywhere (pennsieve-app computeResourcesStore.js).
import { api2 } from "@/services/pennsieveApi";

const NODE_STATUS = {
  enabled: "Enabled",
  active: "Enabled",
  running: "Enabled",
  ready: "Enabled",
  paused: "Paused",
  stopped: "Paused",
  disabled: "Paused",
  destroying: "Destroying",
  failed: "Failed",
  updating: "Updating",
};
// A node's status for people; Pending for anything else.
export const nodeStatus = (node) => NODE_STATUS[(node?.status || "").toLowerCase()] || "Pending";
export const nodeBusy = (node) => ["Pending", "Updating", "Destroying"].includes(nodeStatus(node));

// Whether a node runs notebooks.
export const runsNotebooks = (node) =>
  (node?.maxInteractiveSessions || 0) > 0 || node?.enableInteractive === true || node?.interactive === true;

// A node's region, from its queue URL (the API has no region field).
export const nodeRegion = (node) =>
  String(node?.queueUrl || node?.computeNodeGatewayUrl || "").match(/\.([a-z]{2}-[a-z]+-\d)\./)?.[1] || "";

// Why a node can't read a dataset ("" when it can): a compliant node reaches
// public buckets only in its own region.
export function dataReason(node, dataset) {
  if ((node?.deploymentMode || "basic") !== "compliant") return "";
  const region = nodeRegion(node);
  if (!region || !dataset?.regions?.length || dataset.regions.includes(region)) return "";
  return `This node can only read data in ${region}; the dataset is in ${dataset.regions.join(", ")}.`;
}

// The user's own nodes plus shared ones, such as Pennsieve's (platform: true).
export async function listNodes() {
  const body = await api2("/compute/resources/compute-nodes");
  return Array.isArray(body) ? body : body?.nodes || [];
}

// The user's connected AWS accounts.
export async function listAccounts() {
  const body = await api2("/compute/resources/accounts");
  return Array.isArray(body) ? body : body?.accounts || [];
}

// What connecting an account takes: { roleName, externalId,
// cloudFormation: { quickCreateUrl, templateVersion, ... } }. The external
// id is issued for 24 hours, so ask again for each connection.
export const roleSetup = (accountId) =>
  api2(`/compute/resources/role-policy?externalId=true&accountId=${encodeURIComponent(accountId)}`);

// Registers the account; this fails until the CloudFormation stack is made,
// since Pennsieve checks it can take on the role.
export async function registerAccount({ accountId, name, setup }) {
  const account = await api2("/compute/resources/accounts", {
    method: "POST",
    body: {
      accountId,
      accountType: "AWS",
      roleName: setup.roleName,
      externalId: setup.externalId,
      ...(name && { name }),
      ...(setup.cloudFormation?.templateVersion && { templateVersion: setup.cloudFormation.templateVersion }),
    },
  });
  // Best effort, as pennsieve-app does: lets the account pull apps' images.
  api2("/compute/resources/app-store/access", { method: "POST", body: { accountId, accountType: "AWS" } }).catch((err) =>
    console.warn("App store access failed:", err.message)
  );
  return account;
}

// Creates a basic node, with notebooks on and no GPUs, on a connected
// account (its uuid). The node is made in the background: list to see it.
// enableLLMAccess: the user opted in to AI (the notebooks' code assistant),
// through Amazon Bedrock in their account, within the node's daily budget.
// A basic node needs no BAA.
export const createBasicNode = ({ accountUuid, name, description, enableLLMAccess = false }) =>
  api2("/compute/resources/compute-nodes", {
    method: "POST",
    body: {
      name,
      description,
      accountId: accountUuid,
      provisionerImage: "pennsieve/compute-node-aws-provisioner-v2",
      deploymentMode: "basic",
      enableLLMAccess: !!enableLLMAccess,
      llmBaaAcknowledged: false,
      // The server gives 2 when it isn't sent.
      maxGpuInstances: 0,
      gpuTier: "small",
      maxInteractiveSessions: 4,
    },
  });

// 1234-5678-9012
export const formatAccountId = (id = "") => String(id).replace(/(\d{4})(?=\d)/g, "$1-");

// A 12-digit account id from what was typed: digits with dashes or spaces,
// or an ARN; null when there is none.
export function parseAccountId(input = "") {
  const arn = String(input).match(/^arn:aws[a-z-]*:[^:]*:[^:]*:(\d{12}):/);
  if (arn) return arn[1];
  const digits = String(input).replace(/[\s-]/g, "");
  return /^\d{12}$/.test(digits) ? digits : null;
}

// Deletes a node: Pennsieve removes its resources from the AWS account in
// the background (it shows Destroying, then is gone).
export const deleteNode = (uuid) => api2(`/compute/resources/compute-nodes/${uuid}`, { method: "DELETE" });

// Disconnects an account from Pennsieve. Refused (409) while it has nodes.
export const disconnectAccount = (uuid) => api2(`/compute/resources/accounts/${uuid}`, { method: "DELETE" });

// The account's nodes, among those listed.
export const accountNodes = (account, nodes) =>
  (nodes || []).filter((n) => !n.platform && (n.account?.uuid === account.uuid || n.accountUuid === account.uuid));

// The AWS console's CloudFormation stacks, filtered to the one that gave
// Pennsieve its role (named after the role), for the user to delete.
export const stackConsoleUrl = (account) =>
  `https://console.aws.amazon.com/cloudformation/home#/stacks?filteringText=${encodeURIComponent(account?.roleName || "")}&filteringStatus=active`;
