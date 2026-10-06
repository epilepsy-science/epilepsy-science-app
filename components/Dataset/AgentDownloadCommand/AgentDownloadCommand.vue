<script setup>
import { computed, ref, watch } from 'vue'
import CommandBox from './CommandBox.vue'
import {
  agentPublicCommand,
  agentSelectionCommand,
  awsAccess,
  awsCommands,
  createPublicSelection,
  selectionEndpoint,
  AGENT_DOCS_URL,
  AGENT_MIN_VERSION,
} from '~/utils/agentDownload'

// The Pennsieve agent command for a download too large for the browser.
// With paths, the selection is saved first (anonymously, through the public
// downloads API), so the command is short however many files were selected.
// If it can't be saved, the command names the version and paths itself.
//
// The agent needs an API key, which only Pennsieve workspace members can
// create; with awsUri (the latest version's S3 location) and awsItems, the
// AWS CLI is offered for everyone else.
const props = defineProps({
  datasetId: { type: [Number, String], required: true },
  version: { type: [Number, String], default: 0 },
  paths: { type: Array, default: () => [] },
  folderName: { type: String, default: '' },
  awsUri: { type: String, default: '' },
  // [{ path, isFolder }]
  awsItems: { type: Array, default: () => [] },
})

const runtimeConfig = useRuntimeConfig()

const signUpUrl = computed(() => `${runtimeConfig.public.workspace_app_host.replace(/\/+$/, '')}/sign-up`)

// saving → selection (a saved selection) or paths (the command names them).
const state = ref('paths')
const selectionId = ref('')
let latest = 0

watch(
  () => [props.datasetId, props.version, props.paths.join('\n')],
  async () => {
    const request = ++latest
    if (props.paths.length === 0) {
      state.value = 'paths'
      return
    }
    state.value = 'saving'
    try {
      const token = await useGetToken()
      const url = selectionEndpoint({
        api2Host: runtimeConfig.public.api2_host,
        publicHost: runtimeConfig.public.download_public_host,
        token,
      })
      if (!url) throw new Error('no way to save a selection here')
      const selection = await createPublicSelection({
        url,
        token,
        datasetId: props.datasetId,
        version: props.version,
        paths: props.paths,
      })
      if (request !== latest) return
      selectionId.value = selection.id
      state.value = 'selection'
    } catch (e) {
      if (request !== latest) return
      state.value = 'paths'
    }
  },
  { immediate: true }
)

const command = computed(() =>
  state.value === 'selection'
    ? agentSelectionCommand({ selectionId: selectionId.value, folderName: props.folderName })
    : agentPublicCommand(props)
)

const showAws = ref(false)
const aws = computed(() => awsCommands({ uri: props.awsUri, items: props.awsItems, folderName: props.folderName }))
const awsOpenData = computed(() => awsAccess(props.awsUri) === 'open-data')
</script>

<template>
  <div class="agent-download-command">
    <command-box :lines="[command]" :pending="state === 'saving' ? 'Preparing the command…' : ''" />
    <ol class="steps">
      <li>
        <a :href="signUpUrl" target="_blank" rel="noopener">Create a free Pennsieve account</a>,
        if you don't have one.
      </li>
      <li>
        <a :href="AGENT_DOCS_URL" target="_blank" rel="noopener">Install the Pennsieve agent</a>
        {{ AGENT_MIN_VERSION }} or later, and set it up with an API key from
        your Pennsieve workspace.
      </li>
      <li>
        Run the command in the folder to download into.
        <template v-if="state === 'selection'">It works for two days.</template>
      </li>
    </ol>

    <div v-if="aws.length" class="aws">
      <button type="button" class="aws-toggle" @click="showAws = !showAws">
        Not in a Pennsieve workspace? Download with the AWS CLI instead
      </button>
      <template v-if="showAws">
        <command-box :lines="aws" />
        <p class="aws-note">
          <template v-if="awsOpenData">
            The files are AWS Open Data: no AWS account needed.
          </template>
          <template v-else>
            The files are in a Requester Pays bucket: your AWS account pays for the transfer.
          </template>
        </p>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables';

.agent-download-command {
  // Steps numbered in circles.
  .steps {
    counter-reset: step;
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    font-size: 14px;
    line-height: 20px;
    color: variables.$gray_5;

    li {
      counter-increment: step;
      position: relative;
      margin: 0 0 10px;
      padding-left: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      &::before {
        content: counter(step);
        position: absolute;
        left: 0;
        top: -1px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #e9edf6;
        color: variables.$purple_2;
        font-size: 12px;
        font-weight: 600;
        line-height: 22px;
        text-align: center;
      }
    }

    a {
      color: variables.$purple_2;
      font-weight: 500;
    }
  }

  .aws {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid variables.$gray_2;
  }

  .aws-toggle {
    margin: 0 0 10px;
    padding: 0;
    border: none;
    background: none;
    font-size: 14px;
    color: variables.$purple_2;
    font-weight: 500;
    cursor: pointer;
    text-align: left;

    &:hover {
      text-decoration: underline;
    }
  }

  .aws-note {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 18px;
    color: variables.$gray_4;
  }
}
</style>
