<template>
  <div v-if="stage === 'ready'" class="session">
    <NotebookSession :run-id="runId" />
  </div>
  <section v-else class="page">
    <NuxtLink to="/notebooks" class="back">← My notebooks</NuxtLink>
    <h1>{{ run?.name || "Your notebook" }}</h1>

    <div v-if="stage === 'ended'" class="ended">
      <h2>This notebook has stopped</h2>
      <p class="muted">Status: {{ run?.status }}</p>
      <el-button type="primary" @click="router.push('/notebooks/new')">Start another notebook</el-button>
    </div>

    <div v-else-if="stage === 'failed'" class="ended">
      <h2>The notebook couldn't start</h2>
      <p class="error">{{ error }}</p>
      <el-button type="primary" @click="router.push('/notebooks/new')">Try again</el-button>
    </div>

    <div v-else class="starting">
      <div class="clock">
        <span class="elapsed">{{ clock(elapsed) }}</span>
        <span class="eta">{{ etaLabel }}</span>
      </div>
      <div class="bar"><span class="fill" :style="{ width: progress + '%' }" /></div>
      <ol class="progress">
        <li v-for="(s, i) in STAGES" :key="s.title" :class="{ done: i < current, now: i === current }">
          <span class="dot" />
          <span>
            <strong>{{ s.title }}</strong>
            <span class="muted">{{ i < current ? doneLabel(stageTimes[i]) : s.text }}</span>
          </span>
        </li>
      </ol>
      <p class="muted">
        <template v-if="slow">
          This is taking longer than usual. The first notebook on a node can take up to five minutes while it starts
          a machine and pulls the environment.
        </template>
        <template v-else>
          Usually one to two minutes. You can leave this page; the notebook keeps starting, and you'll find it under My
          notebooks.
        </template>
      </p>
    </div>
  </section>
</template>

<script setup>
// A notebook: its start, timed, then the notebook itself (NotebookSession:
// @pennsieve/notebooks' JupyterSession), as in LabBooks.
import { RUNNING, getRun, sessionConnect } from "@/services/notebooks";

definePageMeta({ middleware: "visitor" });
useHead({ title: "Notebook · Epilepsy.Science" });

const route = useRoute();
const router = useRouter();
const runId = route.params.runId;

// What a start goes through. There's no progress signal from the node, so
// the bar is timed (as pennsieve-app's JupyterSession.vue): about a minute
// for the compute, then about 16 s for the notebook. It eases towards each
// phase's ceiling and only reaches 100% when the notebook answers.
const STAGES = [
  { title: "Notebook requested", text: "Sending the request to the compute node" },
  { title: "Starting compute", text: "Starting a machine and the notebook's environment (about a minute)" },
  { title: "Starting the notebook", text: "Waiting for the notebook to answer (a few seconds)" },
  { title: "Ready", text: "" },
];
const PHASES = [
  { ms: 5000, ceiling: 8 },
  { ms: 60000, ceiling: 85 },
  { ms: 16000, ceiling: 98 },
];
// Past this, say it's slow.
const SLOW_MS = 3 * 60 * 1000;

const run = ref(null);
const connection = ref(null);
// starting, ready, ended or failed
const stage = ref("starting");
// The open notebook fills the window under the header: the layout leaves
// out the site's footer while it's open (useFullScreen).
const fullScreen = useFullScreen();
watch(stage, (s) => (fullScreen.value = s === "ready"), { immediate: true });
const current = ref(0);
const error = ref("");

const startedAt = ref(Date.now());
const now = ref(Date.now());
const stageStart = ref(Date.now());
const stageTimes = ref([]);
const progress = ref(0);
let floor = 0;
let ticker = null;
let timer = null;

const elapsed = computed(() => Math.max(0, now.value - startedAt.value));
const slow = computed(() => elapsed.value > SLOW_MS);

const clock = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// A step done the moment the page saw it (the request, made before the
// page opened) has no time worth showing.
const doneLabel = (ms = 0) => (ms < 1000 ? "Done" : `Done in ${clock(ms)}`);

// Time left in the timed phases, roughly.
const etaLabel = computed(() => {
  if (current.value >= 3) return "Ready";
  const inStage = now.value - stageStart.value;
  const left = PHASES.slice(current.value).reduce((sum, p) => sum + p.ms, 0) - inStage;
  if (slow.value || left <= 5000) return "Almost there…";
  if (left >= 60000) return `About ${Math.round(left / 60000)} min left`;
  return `About ${Math.ceil(left / 10000) * 10} s left`;
});

function tick() {
  now.value = Date.now();
  const phase = PHASES[current.value];
  if (!phase) return;
  const frac = Math.min(1, (now.value - stageStart.value) / phase.ms);
  const val = floor + (phase.ceiling - floor) * (1 - Math.pow(1 - frac, 2));
  if (val > progress.value) progress.value = val;
}

function advance(to) {
  while (current.value < to) {
    stageTimes.value[current.value] = Date.now() - stageStart.value;
    current.value++;
    stageStart.value = Date.now();
    floor = progress.value;
  }
  if (to >= 3) {
    progress.value = 100;
    stage.value = "ready";
    clearInterval(ticker);
  }
}

// Whether the notebook server answers yet; it can take a few seconds after the
// session is up (a gateway error or no CORS headers until then).
async function labAnswers(conn) {
  try {
    const resp = await fetch(`${conn.kernelUrl.replace(/\/$/, "")}/api/status`, {
      headers: { Authorization: `token ${conn.token}` },
    });
    return resp.ok;
  } catch {
    return false;
  }
}

let labTries = 0;
async function poll() {
  try {
    run.value = await getRun(runId);
    if (run.value?.startedAt) startedAt.value = Math.min(startedAt.value, Date.parse(run.value.startedAt) || startedAt.value);
    if (run.value && !RUNNING.includes(run.value.status)) {
      stage.value = run.value.status === "FAILED" ? "failed" : "ended";
      error.value = run.value.error || run.value.message || "The run failed.";
      clearInterval(ticker);
      return;
    }
    if (current.value < 1) advance(1);
    if (!connection.value) connection.value = await sessionConnect(runId);
    if (connection.value) {
      if (current.value < 2) advance(2);
      labTries++;
      // Open it anyway after a minute: the check may be blocked where the
      // browser isn't.
      if ((await labAnswers(connection.value)) || labTries > 30) {
        advance(3);
        return;
      }
    }
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      stage.value = "failed";
      error.value = "Only the person who started this notebook can open it.";
      clearInterval(ticker);
      return;
    }
  }
  timer = setTimeout(poll, 2000);
}

onMounted(() => {
  ticker = setInterval(tick, 250);
  poll();
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  clearInterval(ticker);
  fullScreen.value = false;
});
</script>

<style lang="scss" scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: 72px 20px 64px;
}

.back {
  display: inline-block;
  margin: 8px 0 16px;
  font-size: 14px;
}

h1 {
  margin: 0 0 32px;
  color: $es-black;
}

// The notebook fills the window below the site's header.
.session {
  display: flex;
  height: calc(100vh - var(--es-header-height, 72px));
}

.starting {
  padding: 32px;
  border: 1px solid $es-border;
  border-radius: $es-radius;
}

.clock {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.elapsed {
  color: $es-black;
  font-size: 32px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.eta {
  color: #555;
}

.bar {
  height: 8px;
  margin-bottom: 28px;
  overflow: hidden;
  border-radius: 4px;
  background: $es-border;
}

.fill {
  display: block;
  height: 100%;
  background: $es-primary;
}

.progress {
  display: grid;
  gap: 16px;
  margin: 0 0 24px;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    color: #777;

    > span:last-child {
      display: grid;
      gap: 2px;
    }

    strong {
      font-weight: 500;
    }

    &.done {
      color: #333;
    }

    &.now {
      color: $es-black;
      font-weight: 500;
    }
  }
}

.dot {
  flex: none;
  margin-top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #ccc;

  .done & {
    border-color: $es-mint;
    background: $es-mint;
  }

  .now & {
    border-color: $es-primary;
    animation: pulse 1.2s ease-in-out infinite;
  }
}

@keyframes pulse {
  50% {
    background: $es-primary;
  }
}

.muted {
  color: #777;
}

.error {
  color: #c14d49;
}

.ended h2 {
  font-size: 20px;
}

</style>
