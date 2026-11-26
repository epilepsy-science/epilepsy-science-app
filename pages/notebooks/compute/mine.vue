<template>
  <div>
    <NotebooksHero title="My compute" tab="compute">
      Your compute nodes and the AWS accounts they run in.
    </NotebooksHero>

  <section class="page">
    <div class="head">
      <div class="buttons">
        <el-button @click="router.push('/notebooks/compute/connect')">Connect an AWS account</el-button>
        <el-button type="primary" :disabled="!accounts?.length" @click="router.push('/notebooks/compute/new-node')">Create a compute node</el-button>
      </div>
    </div>

    <el-alert v-if="error" :title="error" type="error" :closable="false" />

    <h2>Compute nodes</h2>
    <div v-loading="!nodes" class="cards">
      <article v-for="n in nodes || []" :key="n.uuid" class="card">
        <div class="card-head">
          <strong>{{ n.platform ? "Pennsieve Shared Compute Node" : n.name }}</strong>
          <el-tag :type="STATUS_TAG[nodeStatus(n)] || 'info'" size="small">{{ nodeStatus(n) }}</el-tag>
        </div>
        <p>{{ n.platform ? "Run by Pennsieve for everyone. Nothing to set up." : n.description }}</p>
        <p class="muted">
          <template v-if="n.platform">Shared</template>
          <template v-else>
            Your AWS account {{ formatAccountId(n.account?.accountId) }}<template v-if="nodeRegion(n)"> · {{ nodeRegion(n) }}</template>
          </template>
          · {{ runsNotebooks(n) ? "Runs notebooks" : "Notebooks off" }}
          <template v-if="!n.platform"> · {{ OWN_NODE_IDLE.toLowerCase() }}</template>
        </p>
        <NodeSetupInfo v-if="!n.platform" :status="nodeStatus(n)" />
        <el-button
          v-if="!n.platform && nodeStatus(n) !== 'Destroying'"
          link
          type="danger"
          class="card-action"
          @click="confirm = { kind: 'node', item: n }"
        >
          Delete node
        </el-button>
      </article>
      <p v-if="nodes && !nodes.length" class="muted">No compute nodes yet.</p>
    </div>

    <h2>AWS accounts</h2>
    <div v-loading="!accounts" class="cards">
      <article v-for="a in accounts || []" :key="a.uuid" class="card">
        <div class="card-head">
          <strong>{{ a.name || "AWS account" }}</strong>
          <el-tag :type="a.status === 'Enabled' ? 'success' : 'info'" size="small">{{ a.status || "Connected" }}</el-tag>
        </div>
        <p class="muted">{{ formatAccountId(a.accountId) }}</p>
        <div class="card-actions">
          <el-button link type="primary" @click="router.push({ path: '/notebooks/compute/new-node', query: { account: a.uuid } })">
            Create a compute node here →
          </el-button>
          <el-tooltip
            :disabled="!accountNodes(a, nodes).length"
            content="Delete this account's compute nodes first"
            placement="top"
          >
            <span>
              <el-button
                link
                type="danger"
                :disabled="!!accountNodes(a, nodes).length"
                @click="confirm = { kind: 'account', item: a }"
              >
                Disconnect
              </el-button>
            </span>
          </el-tooltip>
        </div>
      </article>
      <div v-if="accounts && !accounts.length" class="card empty">
        <p>Connect your AWS account to run notebooks on your own compute node, with your own AWS billing.</p>
        <el-button type="primary" @click="router.push('/notebooks/compute/connect')">Connect an AWS account</el-button>
      </div>
    </div>

    <section v-if="accounts?.length || removed.length" class="remove">
      <h2>Removing your AWS account</h2>
      <p>Three steps, and nothing of Pennsieve's is left in your account:</p>
      <ol>
        <li><strong>Delete its compute nodes</strong> above. Pennsieve removes everything it built in your account.</li>
        <li><strong>Disconnect the account</strong> above, once its nodes are gone.</li>
        <li>
          <strong>Delete the CloudFormation stack</strong> that gave Pennsieve its role, in your AWS console
          <template v-if="removed.length">
            (<a v-for="(a, i) in removed" :key="a.uuid" :href="stackConsoleUrl(a)" target="_blank" rel="noopener"
              >{{ a.roleName || formatAccountId(a.accountId) }}<template v-if="i < removed.length - 1">, </template></a
            >)</template
          >. Only you can delete it, since it lives in your account.
        </li>
      </ol>
    </section>

    <el-dialog
      :model-value="!!confirm"
      :title="confirm?.kind === 'node' ? 'Delete this compute node?' : 'Disconnect this AWS account?'"
      width="460px"
      align-center
      @update:model-value="(v) => !v && (confirm = null)"
    >
      <p v-if="confirm?.kind === 'node'" class="dialog-text">
        Pennsieve removes <strong>{{ confirm.item.name }}</strong> and everything it built for it from your AWS account.
        This takes a few minutes. Notebooks running on it stop.
      </p>
      <p v-else-if="confirm" class="dialog-text">
        Pennsieve stops using AWS account <strong>{{ formatAccountId(confirm.item.accountId) }}</strong>. Afterwards,
        delete the CloudFormation stack in your AWS console to remove Pennsieve's role; we'll link you to it.
      </p>
      <p v-if="confirmError" class="dialog-error">{{ confirmError }}</p>
      <template #footer>
        <el-button @click="confirm = null">Cancel</el-button>
        <el-button type="danger" :loading="confirming" @click="confirmRemove">
          {{ confirm?.kind === "node" ? "Delete node" : "Disconnect" }}
        </el-button>
      </template>
    </el-dialog>

    <div class="more">
      Need secure or compliant compute for sensitive data?
      <a :href="BRAND.contactUrl" target="_blank" rel="noopener">Talk to the Pennsieve team</a>.
    </div>
  </section>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "visitor" });
import { ElMessage } from "element-plus";
import { BRAND, OWN_NODE_IDLE } from "@/utils/computeBrand";
import {
  accountNodes,
  deleteNode,
  disconnectAccount,
  formatAccountId,
  listAccounts,
  listNodes,
  nodeBusy,
  nodeRegion,
  nodeStatus,
  runsNotebooks,
  stackConsoleUrl,
} from "@/services/compute";

const router = useRouter();
const nodes = ref(null);
const accounts = ref(null);
const error = ref("");
let timer = null;

const STATUS_TAG = { Enabled: "success", Failed: "danger", Paused: "info", Pending: "warning", Updating: "warning", Destroying: "warning" };

// Nodes are made in the background: look again every 30 s while one is.
async function loadNodes() {
  try {
    nodes.value = await listNodes();
  } catch (err) {
    nodes.value = [];
    error.value = `Couldn't load compute nodes: ${err.message}`;
  }
  if (nodes.value.some(nodeBusy)) timer = setTimeout(loadNodes, 30000);
}

// Removing: what's being confirmed ({ kind: node|account, item }), and the
// accounts disconnected here, whose stacks are left to delete.
const confirm = ref(null);
const confirming = ref(false);
const confirmError = ref("");
const removed = ref([]);

async function confirmRemove() {
  const { kind, item } = confirm.value;
  confirming.value = true;
  confirmError.value = "";
  try {
    if (kind === "node") {
      await deleteNode(item.uuid);
      ElMessage.success("Deleting the node. It is removed from your AWS account in a few minutes.");
      clearTimeout(timer);
      loadNodes();
    } else {
      await disconnectAccount(item.uuid);
      removed.value.push(item);
      accounts.value = accounts.value.filter((a) => a.uuid !== item.uuid);
      ElMessage.success("Disconnected. Last step: delete the CloudFormation stack in your AWS console.");
    }
    confirm.value = null;
  } catch (err) {
    confirmError.value =
      err.status === 409 ? "Delete this account's compute nodes first, and wait until they are gone." : err.message;
  }
  confirming.value = false;
}

onMounted(async () => {
  loadNodes();
  try {
    accounts.value = await listAccounts();
  } catch (err) {
    accounts.value = [];
    error.value = `Couldn't load AWS accounts: ${err.message}`;
  }
});
onBeforeUnmount(() => clearTimeout(timer));
</script>

<style lang="scss" scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 64px;
}

.head {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 8px;
}

h2 {
  margin: 32px 0 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  min-height: 80px;
}

.card {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 20px;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  background: #fff;

  p {
    margin: 0;
    line-height: 1.5;
  }

  .el-button {
    justify-self: start;
  }
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.muted {
  color: #777;
  font-size: 13px;
}

.card-action {
  justify-self: start;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.remove {
  margin-top: 40px;
  padding: 20px 24px;
  border: 1px solid $es-border;
  border-radius: $es-radius;

  h2 {
    margin: 0 0 8px;
  }

  p {
    margin: 0 0 8px;
  }

  ol {
    display: grid;
    gap: 8px;
    margin: 0;
    padding-left: 20px;
    line-height: 1.6;
  }
}

.dialog-text {
  margin: 0;
  line-height: 1.5;
}

.dialog-error {
  margin: 12px 0 0;
  color: #c14d49;
  font-size: 13px;
}

.more {
  margin-top: 40px;
  padding: 16px;
  border-radius: $es-radius;
  background: $es-primary-tint;
}
</style>
