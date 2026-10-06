<script setup>
import { computed } from 'vue'

// The progress of a zip archive (usePublicArchive), with what can be done
// with it. Text takes the surrounding color, so it reads on the Get Dataset
// dialog's purple panel and on white backgrounds alike.
const props = defineProps({
  archive: { type: Object, default: null },
  error: { type: String, default: '' },
  starting: { type: Boolean, default: false },
  signedIn: { type: Boolean, default: false },
  // On a dark background.
  inverted: { type: Boolean, default: false },
})

const emit = defineEmits(['download', 'remove'])

const status = computed(() => (props.starting ? 'STARTING' : props.archive?.status || ''))
const name = computed(() => props.archive?.archiveName || 'Your download')

const percent = computed(() => {
  const a = props.archive
  if (!a || !a.totalBytes) return 0
  return Math.min(100, Math.round((100 * (a.bytesDone || 0)) / a.totalBytes))
})

const expires = computed(() => {
  const at = props.archive?.expiresAt
  return at ? new Date(at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''
})
</script>

<template>
  <div
    v-if="status && status !== 'CANCELLED' || error"
    class="public-archive-status"
    :class="{ inverted }"
  >
    <template v-if="status === 'STARTING'">
      <p class="headline">Starting your download…</p>
    </template>

    <template v-else-if="status === 'QUEUED' || status === 'RUNNING'">
      <p class="headline">
        Preparing {{ name }}<template v-if="archive.fileCount">:
          {{ archive.filesDone || 0 }} of {{ archive.fileCount }} files</template>
      </p>
      <el-progress
        :percentage="percent"
        :show-text="false"
        :stroke-width="6"
        :color="inverted ? '#ffffff' : '#4d628c'"
      />
      <p class="note">
        <template v-if="signedIn">
          You can close this window: we'll email you when it's ready.
        </template>
        <template v-else>
          You can close this window and come back to this page, in this
          browser, until {{ expires }}.
        </template>
        <button type="button" class="link" @click="emit('remove')">Cancel</button>
      </p>
    </template>

    <template v-else-if="status === 'READY'">
      <p class="headline">{{ name }} is ready ({{ useFormatMetric(archive.archiveBytes) }}).</p>
      <p v-if="archive.skippedCount" class="note">
        {{ archive.skippedCount }} {{ archive.skippedCount === 1 ? "file couldn't" : "files couldn't" }}
        be included; they're listed in FILES_NOT_INCLUDED.txt in the archive.
      </p>
      <p class="note">
        <button type="button" class="link" @click="emit('download')">Download</button>
        · available until {{ expires }} ·
        <button type="button" class="link" @click="emit('remove')">Remove</button>
      </p>
    </template>

    <template v-else-if="status === 'FAILED'">
      <p class="headline">{{ archive.error || 'The download could not be prepared.' }}</p>
      <p class="note">
        <button type="button" class="link" @click="emit('remove')">Dismiss</button>
      </p>
    </template>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables';

.public-archive-status {
  color: variables.$gray_6;
  font-size: 14px;
  line-height: 20px;

  p {
    margin: 0 0 8px;
    color: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  .headline {
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .note {
    margin-top: 8px;
    color: variables.$gray_4;
  }

  .error {
    color: variables.$red_1;
  }

  .link {
    padding: 0;
    border: none;
    background: none;
    color: variables.$purple_2;
    font: inherit;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &.inverted {
    color: #ffffff;

    .note {
      color: #cddaff;
    }

    .error {
      color: #ffd6d6;
    }

    .link {
      color: #ffffff;
      text-decoration: underline;
    }
  }
}
</style>
