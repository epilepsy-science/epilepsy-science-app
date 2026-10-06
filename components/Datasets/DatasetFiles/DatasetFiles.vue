<script setup>
import {ref, watch} from "vue";
import {ElMessage} from "element-plus";
import BfButton from "~/components/Shared/BfButton/BfButton.vue";
import IconUpload from "~/components/Icons/IconUpload.vue";
import IconRemove from "~/components/Icons/IconRemove.vue";
import {useMainStore} from '~/store/index.js'
import DatasetFilesFooter from "~/components/Datasets/DatasetFilesFooter/DatasetFilesFooter.vue";
import DatasetFilesHeader from "~/components/Datasets/DatasetFilesHeader/DatasetFilesHeader.vue";
import AgentDownloadCommand from "~/components/Dataset/AgentDownloadCommand/AgentDownloadCommand.vue";
import PublicArchiveStatus from "~/components/Dataset/PublicArchiveStatus/PublicArchiveStatus.vue";
import {usePublicArchive} from "~/composables/usePublicArchive";
import {
  isActive,
  publicDownloadsBase,
  publicFileUrl,
  rememberedArchives,
  startBrowserDownload,
} from "~/utils/publicDownloads";

const store = useMainStore()
const route = useRoute()
const DEFAULT_ARCHIVE_NAME = 'pennsieve-discover-data'
const runtimeConfig = useRuntimeConfig()

const props = defineProps({
  datasetType: {type: String, default: 'research'},
  datasetId: {type: Number, default:0},
  version: {type: Number, default:0},
  isEmbargoed: {type: Boolean, default:false},
  embargoedReleaseDate: {type: String, default:''},
  // The latest version's S3 location, for the AWS CLI alternative to the
  // agent; empty for older versions, whose files need their object versions.
  awsUri: {type: String, default:''}
})

const isLoading = ref(true)
const hasError = ref(false)

// ---- Get and Manage Files ----
const getFilesUrl= computed( () => {
  const filesType = props.datasetType === 'research' ? "files" : "assets"

  return props.version === 0
    ? ''
    : `${runtimeConfig.public.discover_api_host}/datasets/${props.datasetId}/versions/${props.version}/${filesType}/browse`
})

watch(getFilesUrl, () => {
  getDatasetFiles()
})

onMounted(() => {
  const initialPath = route.query.path || ''
  getDatasetFiles(initialPath)
  // A selection's archive this browser asked for and may come back to.
  const remembered = rememberedArchives({ datasetId: props.datasetId, version: props.version }).filter((a) => !a.whole)
  if (remembered.length) resumeArchive(remembered[remembered.length - 1])
})

const isLoggedin = ref(false)
const offset = ref(0)
const limit = ref(100)
const datasetFiles = ref([])
const totalFileCount = ref(0)
const directoryPath = ref('')

function handleNavigateBreadcrumb(directoryPath) {
  getDatasetFiles(directoryPath)
}

function getDatasetFiles(selectedDirectoryPath = '', loadMoreFiles = false) {
  if(!loadMoreFiles) {
    offset.value = 0
  }
  directoryPath.value = selectedDirectoryPath
  const url = `${getFilesUrl.value}?path=${selectedDirectoryPath}&limit=${limit.value}&offset=${offset.value}`
  useSendXhr(url).then((response) => {
    const files = props.datasetType === 'release' ? response.assets : response.files
    if (offset.value > 0) {
      datasetFiles.value.push(...files)
    } else {
      totalFileCount.value = response.totalCount
      datasetFiles.value = files
    }
  })
  .catch((error) => {
    console.log('error', error)
    hasError.value = true
  })
  .finally(() => {
    isLoading.value = false
  })
}


const loadedFileCount = computed(() => {
  return datasetFiles.value.length || 0
})

function loadMore() {
  offset.value = offset.value + limit.value
  getDatasetFiles(directoryPath.value, true)
}

// ---- Table Functions ----
const checkAll = ref(false)
const selectedFiles = ref([])
const fileTable = useTemplateRef('table')


const selectionCountLabel = computed(()=> {
  const count = selectedFiles.value.length
  return `${count} row${
    count > 1 ? 's' : ''
    } selected`
  })
  
  const isIndeterminate = computed(() => {
    return (
      selectedFiles.value.length > 0 && selectedFiles.value.length < datasetFiles.value.length
    )
  })
  
function handleTableSelectionChange(files) {
  checkAll.value = files.length === loadedFileCount.value
  selectedFiles.value = files
}

function onCheckAllChange(shouldCheckAll) {
  if (shouldCheckAll) {
    fileTable.value.toggleAllSelection()
  } else {
    fileTable.value.clearSelection()
  }
}

function formatType(row) {
  const type = row.type.toLowerCase()
  if (type === 'directory' || type === 'folder') {
    return 'Folder'
  } else if (type === 'file') {
    return row.fileType ? row.fileType : 'Not available'
  }
  return ''
}

function formatStorage(row) {
  return useFormatMetric(row.size)
}

function setPackage(data) {
  store.setSelectedPackage({datasetId: props.datasetId, version: props.version, files: [data]})
}

// ---- DOWNLOAD ----

const downloadConfirmed = ref(false)
const showReduceSize = ref(false)
const archiveName = ref(DEFAULT_ARCHIVE_NAME)
const confirmDownloadVisible = ref(false)

// Folders and several files download as a zip that download-service builds;
// one file downloads directly.
const {
  archive,
  error: archiveError,
  starting,
  signedIn,
  start: startArchive,
  resume: resumeArchive,
  download: downloadArchive,
  remove: removeArchive,
} = usePublicArchive()

/**
 * download is disabled if the total size is greater than the threshold, or no rows are selected
 */
const downloadDisabled = computed(() => {
  if (selectedFiles.value.length === 0) return true
  const totalSize = selectedFiles.value.reduce(
    (total, node) => total + (node.size || 0),
    0
  )

  return totalSize > runtimeConfig.public.max_download_size
})

/**
 * determines whether the confirm download dialog should open
 */
const shouldConfirmDownload = computed(() => {
  return (
    downloadDisabled.value ||
    (selectedFiles.value.length > 1 && !downloadConfirmed.value)
  )
})

const maxDownloadSize = computed(() => {
  return useFormatMetric(runtimeConfig.public.max_download_size)
})

// The selection's size and paths, for the agent command when it's too
// large to zip.
const selectedSize = computed(() => {
  return useFormatMetric(selectedFiles.value.reduce((total, f) => total + (f.size || 0), 0))
})
const selectedPaths = computed(() => selectedFiles.value.map((f) => f.path))
const awsItems = computed(() =>
  selectedFiles.value.map((f) => ({ path: f.path, isFolder: isFolder(f) }))
)

function isFolder(row) {
  const type = (row.type || '').toLowerCase()
  return type === 'directory' || type === 'folder'
}

function onDownloadClick() {
  if (shouldConfirmDownload.value) {
    showReduceSize.value = downloadDisabled.value
    confirmDownloadVisible.value = true
  } else {
    executeDownload()
  }
}

async function executeDownload() {
  const files = selectedFiles.value
  const name = files.length > 1 ? archiveName.value : ''
  closeConfirmDownload()

  if (files.length === 1 && !isFolder(files[0])) {
    await downloadOneFile(files[0])
    return
  }
  if (starting.value || isActive(archive.value)) {
    ElMessage.info('Another download is being prepared; wait for it to finish.')
    return
  }
  await startArchive({
    datasetId: props.datasetId,
    version: props.version,
    paths: files.map((f) => f.path),
    rootPath: directoryPath.value || undefined,
    archiveName: name,
  })
}

async function downloadOneFile(file) {
  try {
    const token = (await useGetToken()) || ''
    const base = publicDownloadsBase({
      api2Host: runtimeConfig.public.api2_host,
      publicHost: runtimeConfig.public.download_public_host,
      token,
    })
    const { url } = await publicFileUrl({ base, token, datasetId: props.datasetId, version: props.version, path: file.path })
    startBrowserDownload(url)
  } catch (e) {
    ElMessage.error(e.message || "Couldn't download the file. Try again.")
  }
}

function confirmDownload() {
  downloadConfirmed.value = true
  onDownloadClick()
}

function closeConfirmDownload() {
  archiveName.value = DEFAULT_ARCHIVE_NAME
  downloadConfirmed.value = false
  showReduceSize.value = false
  confirmDownloadVisible.value = false
}

// ---- ROUTING ----
function getRouteParams(data) {
  const fileId = data.sourcePackageId || encodeURIComponent(data.name)
  return {
    name: 'package-id',
    params: { id: fileId },
    query: { datasetId: props.datasetId, version: props.version, path: data.path }
  }
}

// TODO: replace with packageType check once the API returns it on directory rows
function isTimeseriesDirectory(row) {
  const type = (row.type || '').toLowerCase()
  if (type !== 'directory' && type !== 'folder') return false
  const path = (row.path || row.name || '').toLowerCase()
  return path.includes('ieeg-mef')
}

function handleTimeseriesDirectoryClick(row) {
  const packageData = { ...row, fileType: 'MEF' }
  setPackage(packageData)
  navigateTo(getRouteParams(packageData))
}
</script>

<template>
  <div class="dataset-files">
    <dataset-files-header
      v-if="!isEmbargoed"
      :total-file-count="totalFileCount"
      :loaded-file-count="loadedFileCount"
      :directory-path="directoryPath"
      :limit="limit"
      @navigate-breadcrumb="handleNavigateBreadcrumb"
      @load-more-files="loadMore"
    />
    <public-archive-status
      class="archive-status mb-16"
      :archive="archive"
      :error="archiveError"
      :starting="starting"
      :signed-in="signedIn"
      @download="downloadArchive"
      @remove="removeArchive"
    />
    <div v-if="selectedFiles.length > 0" class="selection-menu-wrap mb-16">
      <el-checkbox
        id="check-all"
        v-model="checkAll"
        :indeterminate="isIndeterminate"
        @change="onCheckAllChange"
      />

      <span id="selection-count-label">
        {{ selectionCountLabel }}
      </span>
      <ul class="selection-actions unstyled">
        <li>
          <button class="linked btn-selection-action" @click="onDownloadClick">
            <IconUpload
              class="mr-8"
              :height="16"
              :width="16"
            />
            <span>Download</span>
          </button>
        </li>
      </ul>
    </div>
    <el-table
      v-if="!hasError"
      ref="table"
      class="table"
      v-loading="isLoading"
      :data="datasetFiles"
      @selection-change="handleTableSelectionChange"
    >
      <el-table-column v-if="props.datasetType === 'research'" type="selection" align="center" />
      <el-table-column label="File Name">
        <template #default="scope">
          <div class="file-name-container">
            <img
              :src="useFileIcon(scope.row.icon, scope.row.type)"
              alt="Icon"
              :class="{ 'clickable-icon': isTimeseriesDirectory(scope.row) }"
              @click="isTimeseriesDirectory(scope.row) && handleTimeseriesDirectoryClick(scope.row)"
            />
            <div v-if="formatType(scope.row) === 'Folder'" class="name">
              <ClientOnly>
                <a
                  href="#"
                  @click.prevent="getDatasetFiles(scope.row.path)"
                >
                  {{ scope.row.name }}
                </a>
              </ClientOnly>

            </div>
            <div v-else  class="name" @click="setPackage(scope.row)">
              <NuxtLink v-if="props.datasetType ==='research'" :to="getRouteParams(scope.row)">
                {{ scope.row.name }}
              </NuxtLink>
              <div v-else>
                {{ scope.row.name }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :formatter="formatType" label="Type" />
      <el-table-column :formatter="formatStorage" prop="size" label="Size"/>

      <template #empty>
        <div class="empty-table">
          No files found.
        </div>
      </template>

    </el-table>

    <div v-if="hasError && !isEmbargoed">
      <p>Sorry, an error has occurred</p>
      <bf-button @click="getDatasetFiles">
        Try again
      </bf-button>
    </div>

    <dataset-files-footer
      v-if="!isEmbargoed || isLoggedin"
      :limit="limit"
      :total-file-count="totalFileCount"
      :loaded-file-count="loadedFileCount"
      :files="datasetFiles"
      @load-more-files="loadMore"
    />

    <client-only>
    <el-dialog
      v-model="confirmDownloadVisible"
      :width="showReduceSize ? 'clamp(min(760px, 92vw), 50%, 92vw)' : undefined"
      :show-close="false"
      @close="closeConfirmDownload"
    >
      <template #header>
        <div class="bf-dialog-header">
          <span class="bf-dialog-header-title">Confirm Download</span>
          <button class="icon-close" @click="closeConfirmDownload">
            <IconRemove :height="12" :width="12" />
          </button>
        </div>
      </template>


      <div class="bf-dialog-body">
        <div v-if="showReduceSize" class="mb-24">
          <p>
            The file(s) you selected are {{ selectedSize }}, more than the
            {{ maxDownloadSize }} you can download as a zip. Download them
            with the Pennsieve agent instead:
          </p>
          <agent-download-command
            :dataset-id="datasetId"
            :version="version"
            :paths="selectedPaths"
            :folder-name="archiveName"
            :aws-uri="awsUri"
            :aws-items="awsItems"
          />
        </div>
        <div v-else-if="selectedFiles.length > 1" class="download-name">
          <label for="downloadName">
            File Name
          </label>
          <el-input id="downloadName" v-model="archiveName" />
          <span>.zip</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <bf-button class="secondary" @click="closeConfirmDownload">
            {{ showReduceSize ? 'Close' : 'Cancel' }}
          </bf-button>
          <bf-button v-if="!showReduceSize" :disabled="downloadDisabled" @click="confirmDownload">
            Download
          </bf-button>
        </div>
      </template>

    </el-dialog>
    </client-only>
  </div>
</template>


<style lang="scss" scoped>
@use '@/assets/scss/variables';

.dataset-files {
  position: relative;
  margin-bottom: 94px;

  .archive-status {
    padding: 12px 16px;
    border: 1px solid variables.$gray_2;
    border-radius: 4px;
  }

  &__message {
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    margin-top: 14px;
  }

  h3 {
    color: variables.$myelin;
    font-size: 16px;
    font-weight: 500;
    line-height: 40px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0;
  }

  :deep(.el-table) {
    .el-table__empty-block {
      border-left: solid 1px variables.$cortex;
      border-right: solid 1px variables.$cortex;
      border-bottom: solid 1px variables.$cortex;
    }

    .el-table__header-wrapper {
      height: 40px;
      .el-table__header {
        border-right: solid 2px variables.$axon;
        .el-table_1_column_1 {
          :deep(.el-checkbox__input) {
            margin-left: 1px;
          }
        }
        .el-table_1_column_2 {
          .cell {
            text-align: left;
          }
        }
        .el-table_1_column_3 {
          text-align: right;
        }
      }
    }

    .el-table__row {
      .el-table_1_column_2 {
        .cell {
          text-align: center;
        }
      }

      .el-table_1_column_3 {
        .cell {
          text-align: right;
        }
      }
    }

    th {
      padding: 9px 0;
    }

    .el-table__body-wrapper {
      border-bottom: none;

      .el-table__body {
        border: solid 1px variables.$cortex;
        border-bottom: none;
      }

      .el-table__row {
        border-right: solid 1px variables.$cortex;
      }
    }

    .el-table__header {
      .el-table_1_column_2 {
        text-align: center;
      }
    }

    th.is-leaf {
      background-color: variables.$axon;
      color: #000;
      font-size: 14px;
      font-weight: 500;
      margin-top: 16px;
    }

    ::before {
      height: 0;
    }

    td {
      padding: 5px 0 5px 0;
      border-color: variables.$cortex;
    }

    .el-table__empty-block {
      width: 99% !important;
      padding-right: 7px;
      margin-top: -1px;
      border-top: solid 1px variables.$cortex;
    }
  }

  :deep(.el-table .el-table__body-wrapper .el-table__body) {
    width: auto !important;
    min-width: 0;
  }

  :deep(.el-table::before,
  .el-table--group::after,
  .el-table--border::after) {
    background-color: variables.$cortex;
    width: 0;
  }

  .table {
    .file-name-container {
      display: flex;

      img {
        height: 20px;
        width: 20px;
        margin: 2px 5px 0 0;

        &.clickable-icon {
          cursor: pointer;
          border-radius: 3px;
          transition: background-color 0.15s;

          &:hover {
            background-color: rgba(0, 0, 0, 0.08);
          }
        }
      }

      .name {
        margin-top: 0;
      }
    }
  }

  .selection-menu-wrap {
    background: #e9edf6;
    border: 1px solid variables.$cortex;
    box-sizing: border-box;
    border-radius: 3px 3px 0 0;
    display: flex;
    padding: 11px 15px 10px;
    position: absolute;
    width: 100%;
    justify-content: space-between;
    z-index: 10;
  }

  .selection-actions {
    display: flex;
    flex: 1;
    justify-content: flex-end;
  }

  #check-all {
    margin-left: 2px;
    margin-right: 26px;
  }

  #selection-count-label {
    font-size: 12px;
    font-weight: 700;
    transform: translateY(1px);
  }

  .btn-selection-action {
    align-items: center;
    display: flex;
    font-size: 14px;
  }

  .bf-dialog-header {
    align-items: center;
    display: flex;
    position: relative;
    .icon-close {
      color: variables.$glial;
      cursor: pointer;
    }
  }

  .bf-dialog-header-title {
    flex: 1;
    font-size: 18px;
    font-weight: 400;
    line-height: 1;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #000;
  }

  .bf-dialog-body {
    word-break: normal;
  }

  .download-name {
    display: flex;
    align-items: center;
    label {
      min-width: 64px;
    }
    :deep(.el-input) {
      margin: 0 8px;
    }
  }
}
</style>
