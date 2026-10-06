<script setup>
import { computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Shell commands to copy and run, one per line, as the Get Dataset dialog
// shows its AWS CLI commands.
const props = defineProps({
  lines: { type: Array, default: () => [] },
  // While the command is being prepared: shown greyed out, not copyable.
  pending: { type: String, default: '' },
})

// Quoted paths keep their spaces: split only outside quotes.
const rows = computed(() => props.lines.map((line) => line.match(/(?:'[^']*'|\\'|[^\s'])+/g) || []))

function copyToClipboard() {
  navigator.clipboard.writeText(props.lines.join('\n')).then(() => {
    ElMessage({
      message: 'Copied to clipboard.',
      type: 'success',
      duration: 3000
    })
  }).catch(() => {
    ElMessage.error("Couldn't copy the command. Select it and copy it instead.")
  })
}
</script>

<template>
  <div class="command-box">
    <code v-if="pending" class="pending">{{ pending }}</code>
    <!-- Each word stays whole: browsers otherwise break after hyphens,
         splitting --path or a folder name across lines. -->
    <code v-else>
      <span v-for="(words, r) in rows" :key="r" class="line"><template
        v-for="(word, i) in words"
        :key="i"
      ><span class="word">{{ word }}</span>{{ i < words.length - 1 ? ' ' : '' }}</template></span>
    </code>
    <button class="copy-button" :disabled="Boolean(pending)" @click="copyToClipboard">
      <CopyDocument width="16" height="16" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables';

.command-box {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 4px;
  background-color: #f1f1f3;
}

code {
  flex: 1;
  min-width: 0;
  font-family: Courier, serif;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  user-select: all;

  &.pending {
    color: variables.$gray_4;
    user-select: none;
  }
}

.line {
  display: block;

  & + .line {
    margin-top: 6px;
  }
}

// A word stays on one line when it fits, and wraps inside only when it's
// longer than the line.
.word {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.copy-button {
  flex-shrink: 0;
  padding: 4px;
  border: none;
  background: none;
  color: #888;
  cursor: pointer;

  &:hover {
    color: #333;
  }

  &:disabled {
    cursor: default;
    opacity: 0.4;
  }
}
</style>
