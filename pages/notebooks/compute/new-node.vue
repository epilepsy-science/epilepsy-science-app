<template>
  <div>
    <NotebooksHero title="Create a compute node">
      Pennsieve builds the node in your AWS account and keeps it up to date. It takes a few minutes.
    </NotebooksHero>

  <section class="page">
    <NuxtLink to="/notebooks/compute/mine" class="back">← My compute</NuxtLink>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="alert" />

    <div v-if="accounts && !accounts.length" class="empty">
      <p>First connect the AWS account the node will run in.</p>
      <el-button type="primary" @click="router.push('/notebooks/compute/connect')">Connect an AWS account</el-button>
    </div>

    <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="create">
      <el-form-item label="AWS account" prop="accountUuid">
        <el-select v-model="form.accountUuid" placeholder="Choose an account" :loading="!accounts" class="wide">
          <el-option
            v-for="a in accounts || []"
            :key="a.uuid"
            :value="a.uuid"
            :label="`${a.name || 'AWS account'} · ${formatAccountId(a.accountId)}`"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" maxlength="50" placeholder="My notebooks node" />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input v-model="form.description" maxlength="255" placeholder="Notebooks on AWS Open Data for my lab" />
      </el-form-item>

      <div class="tier">
        <strong>Basic tier</strong>
        <p>
          For open and non-sensitive data: notebooks with up to 4 running at once, on CPU. It costs less than $5 a month
          while idle, and you can delete it any time from My compute. Secure and compliant nodes, for sensitive and
          clinical data, are part of the full Pennsieve platform.
          <a :href="BRAND.contactUrl" target="_blank" rel="noopener">Talk to the Pennsieve team</a>.
        </p>
      </div>

      <div class="ai">
        <div class="ai__row">
          <div>
            <strong>AI code assistant</strong>
            <p>
              Lets the notebooks' assistant write and fix code for you, with Claude through Amazon Bedrock in this AWS
              account. Your prompts, code and file previews stay in AWS. Usage is billed to the account, up to $5 a day.
              The first time, Bedrock may ask you to request access to Anthropic's models in its console.
            </p>
          </div>
          <el-switch v-model="form.enableLLMAccess" aria-label="Turn on the AI code assistant" />
        </div>
      </div>

      <div class="actions">
        <el-button @click="router.push('/notebooks/compute/mine')">Cancel</el-button>
        <el-button type="primary" native-type="submit" :loading="busy">Create node</el-button>
      </div>
    </el-form>
  </section>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "visitor" });
import { ElMessage } from "element-plus";
import { BRAND } from "@/utils/computeBrand";
import { createBasicNode, formatAccountId, listAccounts } from "@/services/compute";

const route = useRoute();
const router = useRouter();

const accounts = ref(null);
const formRef = ref(null);
const form = ref({ accountUuid: "", name: "", description: "", enableLLMAccess: false });
const busy = ref(false);
const error = ref("");

const rules = {
  accountUuid: [{ required: true, message: "Choose an account", trigger: "change" }],
  name: [{ required: true, min: 3, max: 50, message: "3 to 50 characters", trigger: "blur" }],
  description: [{ required: true, min: 10, max: 255, message: "At least 10 characters", trigger: "blur" }],
};

function create() {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    busy.value = true;
    error.value = "";
    try {
      await createBasicNode({ ...form.value, name: form.value.name.trim(), description: form.value.description.trim() });
      ElMessage.success("Your compute node is being created. This takes a few minutes.");
      router.push("/notebooks/compute/mine");
    } catch (err) {
      error.value = err.status === 403 ? "Only the owner of this AWS account can create nodes on it." : err.message;
    }
    busy.value = false;
  });
}

onMounted(async () => {
  try {
    accounts.value = await listAccounts();
  } catch (err) {
    accounts.value = [];
    error.value = `Couldn't load AWS accounts: ${err.message}`;
    return;
  }
  const wanted = accounts.value.find((a) => a.uuid === route.query.account);
  form.value.accountUuid = wanted?.uuid || (accounts.value.length === 1 ? accounts.value[0].uuid : "");
});
</script>

<style lang="scss" scoped>
.page {
  max-width: 640px;
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

.alert {
  margin-bottom: 16px;
}

.wide {
  width: 100%;
}

.tier {
  padding: 16px;
  border: 1px solid $es-border;
  border-left: 3px solid $es-primary;
  border-radius: 4px;

  p {
    margin: 6px 0 0;
    line-height: 1.6;
  }
}

.ai {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid $es-border;
  border-radius: 4px;

  p {
    margin: 6px 0 0;
    line-height: 1.6;
  }
}

.ai__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}

.empty {
  padding: 24px;
  border: 1px solid $es-border;
  border-radius: $es-radius;
}
</style>
