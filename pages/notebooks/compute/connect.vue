<template>
  <div>
    <NotebooksHero title="Connect your AWS account">
      Pennsieve gets a role in your account that lets it set up and run compute nodes there, and nothing else. You
      pay AWS directly for what your nodes use.
    </NotebooksHero>

  <section class="page">
    <NuxtLink to="/notebooks/compute/mine" class="back">← My compute</NuxtLink>
    <ul class="promises">
      <li><strong>Low cost:</strong> a basic node costs less than $5 a month while idle; notebooks cost only while they run.</li>
      <li>
        <strong>Easy to remove:</strong> delete the node and disconnect the account in My compute, then delete the
        CloudFormation stack. Nothing of Pennsieve's is left behind.
      </li>
    </ul>

    <!-- For someone without an AWS account yet: AWS's own sign-up. -->
    <div class="no-account">
      <div>
        <strong>Don't have an AWS account?</strong>
        <span>Set one up in about 2 minutes, then come back here to connect it.</span>
      </div>
      <el-button tag="a" :href="AWS_SIGNUP_URL" target="_blank" rel="noopener">Create an AWS account ↗</el-button>
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="alert" />

    <ol class="steps">
      <li :class="{ done: !!setup }">
        <h2>Your AWS account ID</h2>
        <p class="muted">The 12 digits in the account menu of the AWS console.</p>
        <div class="row">
          <el-input v-model="accountInput" placeholder="1234-5678-9012" :disabled="!!setup" class="account-input" />
          <el-button v-if="!setup" type="primary" :loading="busy" :disabled="!accountId" @click="openStack">
            Open CloudFormation
          </el-button>
          <el-button v-else link @click="restart">Change</el-button>
        </div>
      </li>
      <li :class="{ off: !setup }">
        <h2>Create the stack</h2>
        <p>
          The AWS console opens in a new tab with the stack filled in. Make sure you are signed in to account
          <strong>{{ accountId ? formatAccountId(accountId) : "…" }}</strong>, tick the acknowledgement and choose
          <em>Create stack</em>. It takes about a minute.
        </p>
        <el-button v-if="setup" link type="primary" @click="openConsole">Open the console again</el-button>
      </li>
      <li :class="{ off: !setup }">
        <h2>Verify</h2>
        <p>Once the stack shows CREATE_COMPLETE, verify the connection.</p>
        <div class="row">
          <el-input v-model="name" placeholder="A name for this account (optional)" :disabled="!setup" class="name-input" />
          <el-button type="primary" :disabled="!setup" :loading="verifying" @click="verify">Verify connection</el-button>
        </div>
      </li>
    </ol>
  </section>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "visitor" });
import { ElMessage } from "element-plus";
import { formatAccountId, parseAccountId, registerAccount, roleSetup } from "@/services/compute";

const router = useRouter();

// AWS's sign-up page for a new account.
const AWS_SIGNUP_URL = "https://portal.aws.amazon.com/billing/signup";

const accountInput = ref("");
const accountId = computed(() => parseAccountId(accountInput.value));
const name = ref("");
const setup = ref(null);
const busy = ref(false);
const verifying = ref(false);
const error = ref("");

function openConsole() {
  window.open(setup.value.cloudFormation.quickCreateUrl, "_blank", "noopener");
}

async function openStack() {
  busy.value = true;
  error.value = "";
  try {
    const s = await roleSetup(accountId.value);
    if (!s?.cloudFormation?.quickCreateUrl) {
      error.value = "Connecting with CloudFormation isn't available in this environment.";
    } else {
      setup.value = s;
      openConsole();
    }
  } catch (err) {
    error.value = err.message;
  }
  busy.value = false;
}

function restart() {
  setup.value = null;
  error.value = "";
}

async function verify() {
  verifying.value = true;
  error.value = "";
  try {
    const account = await registerAccount({ accountId: accountId.value, name: name.value.trim(), setup: setup.value });
    ElMessage.success("Your AWS account is connected.");
    router.push({ path: "/notebooks/compute/new-node", query: { account: account?.uuid } });
  } catch (err) {
    if (err.status === 409 || err.status === 422) {
      error.value = "This AWS account is already connected.";
    } else if (err.status < 500 && !err.body?.message) {
      error.value = "Pennsieve can't use the role yet. The stack may still be creating; try again in a minute.";
    } else {
      error.value = err.message;
    }
  }
  verifying.value = false;
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 20px 64px;
}

.back {
  display: block;
  width: fit-content;
  margin: 0 0 20px;
  color: $es-primary;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
}

.promises {
  display: grid;
  gap: 6px;
  margin: 0 0 32px;
  padding: 16px 16px 16px 36px;
  border-radius: $es-radius;
  background: $es-primary-tint;
  line-height: 1.5;
}

.no-account {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 32px;
  padding: 16px 20px;
  border: 1px solid $es-border;
  border-radius: $es-radius;

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    color: $es-black;
  }

  span {
    font-size: 14px;
    color: #555;
  }
}

.alert {
  margin-bottom: 24px;
}

.steps {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;

  li {
    position: relative;
    padding: 0 0 32px 48px;
    counter-increment: step;

    &::before {
      content: counter(step);
      position: absolute;
      left: 0;
      top: 0;
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: $es-black;
      color: #fff;
      font-weight: 600;
    }

    &.done::before {
      content: "✓";
      background: $es-mint;
    }

    &.off {
      opacity: 0.5;
    }
  }

  h2 {
    margin: 4px 0 8px;
    font-size: 18px;
  }

  p {
    margin: 0 0 12px;
    line-height: 1.6;
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.account-input {
  max-width: 220px;
}

.name-input {
  max-width: 320px;
}

.muted {
  color: #777;
}
</style>
