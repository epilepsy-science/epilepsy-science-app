<template>
  <div>
    <NotebooksHero title="My notebooks" tab="notebooks">
      Python and R notebooks next to Epilepsy.Science's data, running as you.
    </NotebooksHero>

  <section class="page">
    <div class="head">
      <el-button type="primary" @click="router.push('/notebooks/new')">Start a notebook</el-button>
    </div>

    <el-alert v-if="error" :title="error" type="error" :closable="false" />

    <div v-else-if="runs && !runs.length" class="empty">
      <h2>No notebooks yet</h2>
      <p>Pick any Epilepsy.Science dataset and be in a Python or R notebook next to its data in a few clicks.</p>
      <el-button type="primary" size="large" @click="router.push('/notebooks/new')">Start your first notebook</el-button>
    </div>

    <div v-else v-loading="!runs" class="lists">
      <template v-if="running.length">
        <h2>Running</h2>
        <ul class="runs">
          <li v-for="r in running" :key="r.uuid" class="run">
            <div class="run-text">
              <strong>{{ r.name || r.uuid }}</strong>
              <span class="muted">Started {{ when(r.startedAt) }}</span>
            </div>
            <div class="row-actions">
              <span v-if="stopping.has(r.uuid)" class="muted">Stopping…</span>
              <template v-else>
                <el-button v-if="r.status === 'STARTED'" @click="confirmStop = r">Stop</el-button>
                <el-button type="primary" @click="router.push({ name: 'notebooks-runId', params: { runId: r.uuid } })">
                  {{ r.status === "STARTED" ? "Open" : "Starting…" }}
                </el-button>
              </template>
            </div>
          </li>
        </ul>
      </template>
      <template v-if="past.length">
        <h2>Earlier</h2>
        <ul class="runs">
          <li v-for="r in past" :key="r.uuid" class="run past">
            <div class="run-text">
              <strong>{{ r.name || r.uuid }}</strong>
              <span class="muted">{{ when(r.startedAt) }} · {{ statusLabel(r.status) }}</span>
            </div>
          </li>
        </ul>
      </template>
    </div>
    <el-dialog
      :model-value="!!confirmStop"
      title="Stop this notebook?"
      width="440px"
      align-center
      @update:model-value="(v) => !v && (confirmStop = null)"
    >
      <p class="dialog-text">
        Stopping shuts the notebook down. Unsaved changes are lost, so open it first if you need to save your work.
      </p>
      <p v-if="stopError" class="dialog-error">{{ stopError }}</p>
      <template #footer>
        <el-button @click="confirmStop = null">Cancel</el-button>
        <el-button type="danger" :loading="stoppingNow" @click="stop">Stop notebook</el-button>
      </template>
    </el-dialog>
  </section>
  </div>
</template>

<script setup>
// The visitor's notebooks: the running ones to open or stop, then the last
// twenty, as in LabBooks.
import { RUNNING, listNotebookRuns, stopNotebook } from "@/services/notebooks";

definePageMeta({ middleware: "visitor" });
useHead({ title: "My notebooks · Epilepsy.Science" });

const router = useRouter();
const runs = ref(null);
const error = ref("");

const running = computed(() => (runs.value || []).filter((r) => RUNNING.includes(r.status)));
const past = computed(() => (runs.value || []).filter((r) => !RUNNING.includes(r.status)).slice(0, 20));

const when = (iso) => (iso ? new Date(iso).toLocaleString() : "");
const statusLabel = (s) => ({ SUCCEEDED: "Stopped", CANCELED: "Stopped", FAILED: "Failed" })[s] || s?.toLowerCase();

// Stopping: the notebook to confirm, and the ones asked to stop until the
// list says they ended.
const confirmStop = ref(null);
const stoppingNow = ref(false);
const stopError = ref("");
const stopping = ref(new Set());
let timer = null;

async function load() {
  try {
    runs.value = await listNotebookRuns();
    error.value = "";
  } catch (err) {
    error.value = `Couldn't load your notebooks: ${err.message}`;
    return;
  }
  for (const id of stopping.value) {
    if (!running.value.some((r) => r.uuid === id)) stopping.value.delete(id);
  }
  // Look again every 5 s while a notebook is stopping or starting.
  clearTimeout(timer);
  if (stopping.value.size || running.value.some((r) => r.status !== "STARTED")) timer = setTimeout(load, 5000);
}

async function stop() {
  const run = confirmStop.value;
  stoppingNow.value = true;
  stopError.value = "";
  try {
    await stopNotebook(run.uuid);
    stopping.value.add(run.uuid);
    confirmStop.value = null;
    load();
  } catch (err) {
    stopError.value = err.message || "The notebook didn't stop.";
  }
  stoppingNow.value = false;
}

onMounted(load);
onBeforeUnmount(() => clearTimeout(timer));
</script>

<style lang="scss" scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: 32px 20px 64px;
}

.head {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 16px;
}


.empty {
  display: grid;
  justify-items: center;
  padding: 48px 24px;
  border: 1px solid $es-border;
  border-radius: $es-radius;
  text-align: center;

  h2 {
    margin: 16px 0 8px;
    font-size: 22px;
  }

  p {
    max-width: 420px;
    margin: 0 0 24px;
    line-height: 1.6;
  }
}

.lists {
  min-height: 120px;

  h2 {
    margin: 24px 0 12px;
    font-size: 16px;
  }
}

.runs {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid $es-border;
  border-radius: $es-radius;
}

.run {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;

  & + & {
    border-top: 1px solid $es-border;
  }

}

.run-text {
  display: grid;
  gap: 2px;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-button + .el-button {
    margin-left: 0;
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

.muted {
  color: #777;
  font-size: 13px;
}
</style>
