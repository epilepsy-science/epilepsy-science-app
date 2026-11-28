<template>
  <el-button link type="primary" class="trigger" @click="open = true">
    <span class="icon" aria-hidden="true">i</span>{{ label }}
  </el-button>

  <el-dialog v-model="open" :title="title" width="560px" align-center>
    <p class="intro">
      <template v-if="status === 'Destroying'">
        Pennsieve is removing everything below from your AWS account. It takes a few minutes; afterwards, disconnect the
        account and delete its CloudFormation stack to remove Pennsieve's role too.
      </template>
      <template v-else>
        A basic compute node is a set of standard AWS services in your account, all named and tagged after the node
        (<code>ComputeNodeId</code>), so you can find them in the AWS console. Pennsieve creates them with the role you
        gave it, using Terraform<template v-if="busy">; this takes a few minutes</template>.
      </template>
    </p>

    <ul class="items">
      <li v-for="item in ITEMS" :key="item.what">
        <strong>{{ item.what }}</strong>
        <span>{{ item.why }}</span>
        <span class="cost">{{ item.cost }}</span>
      </li>
    </ul>

    <div class="not">
      <strong>What it doesn't do</strong>
      <ul>
        <li>No NAT gateways, load balancers or new networks: a basic node uses your account's default VPC.</li>
        <li>No servers running while idle: notebooks start on demand and stop after an hour of inactivity.</li>
        <li>Nothing else in your account is touched: Pennsieve uses its role only to manage this node's resources.</li>
      </ul>
    </div>

    <p class="total">{{ OWN_NODE_IDLE }} (about $1–2), plus the notebooks while they run.</p>
  </el-dialog>
</template>

<script setup>
// What a basic compute node is in the user's AWS account, as the
// provisioner's Terraform (terraform/infrastructure) makes it in basic mode.
import { OWN_NODE_IDLE } from "@/utils/computeBrand";

const props = defineProps({
  // The node's status for people (services/compute nodeStatus).
  status: { type: String, default: "" },
});

const open = ref(false);
const busy = computed(() => ["Pending", "Updating", "Destroying"].includes(props.status));
const label = computed(() => (busy.value ? "What is Pennsieve doing in my AWS account?" : "What's in my AWS account?"));
const title = computed(() =>
  props.status === "Destroying" ? "Removing your compute node" : busy.value ? "Setting up your compute node" : "Your compute node in AWS"
);

const ITEMS = [
  { what: "ECS cluster (Fargate)", why: "Runs each notebook as a container, only while it is open.", cost: "No cost while idle" },
  { what: "Step Functions state machine", why: "Starts, tracks and stops each notebook run.", cost: "Per run, fractions of a cent" },
  { what: "About 10 Lambda functions", why: "Set runs up, report their status to Pennsieve, and clean up daily.", cost: "Pennies a month" },
  { what: "3 DynamoDB tables and 2 S3 buckets", why: "Run state, logs and run data, encrypted.", cost: "Pennies a month" },
  { what: "1 KMS key", why: "Encrypts the node's run data.", cost: "$1 a month" },
  { what: "CloudWatch log groups", why: "Logs of the node and its notebooks.", cost: "Pennies a month" },
  { what: "IAM roles and security groups", why: "Scoped to this node's own resources.", cost: "Free" },
  { what: "S3 gateway endpoint", why: "Lets notebooks read S3 in the node's region directly.", cost: "Free" },
  { what: "GPU capacity, scaled to zero", why: "Set up but never started on a basic node.", cost: "Free" },
];
</script>

<style lang="scss" scoped>
.trigger {
  justify-self: start;
  font-size: 13px;
}

.icon {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  font-style: italic;
}

.intro {
  margin: 0 0 16px;
  line-height: 1.6;
}

.items {
  display: grid;
  gap: 10px;
  margin: 0 0 16px;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2px 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid $es-panel-grey;
    line-height: 1.4;
  }

  span:not(.cost) {
    grid-column: 1;
    color: #555;
    font-size: 13px;
  }

  .cost {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    color: $es-primary-dark;
    font-size: 13px;
    white-space: nowrap;
  }
}

.not {
  padding: 12px 16px;
  border-radius: $es-radius;
  background: $es-panel-grey;

  ul {
    margin: 6px 0 0;
    padding-left: 18px;
    line-height: 1.6;
    font-size: 13px;
  }
}

.total {
  margin: 16px 0 0;
  font-weight: 500;
}
</style>
