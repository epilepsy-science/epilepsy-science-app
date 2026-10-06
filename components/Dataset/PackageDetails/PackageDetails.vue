<script setup>
import { ElMessage } from 'element-plus'
import { useMainStore } from '~/store/index.js'
import BfButton from '~/components/Shared/BfButton/BfButton.vue'
import PublicArchiveStatus from '~/components/Dataset/PublicArchiveStatus/PublicArchiveStatus.vue'
import { usePublicArchive } from '~/composables/usePublicArchive'
import { filePathOf, isActive, publicDownloadsBase, publicFileUrl, startBrowserDownload } from '~/utils/publicDownloads'

const runtimeConfig = useRuntimeConfig()
const store = useMainStore()

const parentFolderPath = computed(() => {
  const files = store.selectedPackage?.files || []
  if (files.length === 0) return ''
  const filePath = files[0].path || ''
  const lastSlash = filePath.lastIndexOf('/')
  return lastSlash > 0 ? filePath.substring(0, lastSlash) : ''
})

const backToFilesRoute = computed(() => {
  const datasetId = store.selectedPackage?.datasetId
  const route = {
    name: 'datasets-datasetId',
    params: { datasetId },
    hash: '#files'
  }
  if (parentFolderPath.value) {
    route.query = { path: parentFolderPath.value }
  }
  return route
})

const backLinkLabel = 'Back to files'

const downloadContent = computed(() => {
  const files = store.selectedPackage?.files || []
  return files.length > 1 || (files[0] && isFolder(files[0])) ? 'Download Package' : 'Download File'
})

function formatStorage(row, column, cellValue) {
  return useFormatMetric(cellValue)
}

// A file downloads through a download-service link; a folder (a MEF
// recording) or several files as a zip that download-service builds.
const {
  archive,
  error: archiveError,
  starting,
  signedIn,
  start: startArchive,
  download: downloadArchive,
  remove: removeArchive,
} = usePublicArchive()

async function downloadFile(event) {
  event.preventDefault()

  const { datasetId, version, files = [] } = store.selectedPackage
  if (files.length === 0) return
  if (files.length > 1 || isFolder(files[0])) {
    if (starting.value || isActive(archive.value)) return
    await startArchive({ datasetId, version, paths: files.map(filePathOf) })
    return
  }

  try {
    const token = (await useGetToken()) || ''
    const base = publicDownloadsBase({
      api2Host: runtimeConfig.public.api2_host,
      publicHost: runtimeConfig.public.download_public_host,
      token,
    })
    const { url } = await publicFileUrl({ base, token, datasetId, version, path: filePathOf(files[0]) })
    startBrowserDownload(url)
  } catch (e) {
    ElMessage.error(e.message || "Couldn't download the file. Try again.")
  }
}

function isFolder(file) {
  const type = (file.type || '').toLowerCase()
  return type === 'directory' || type === 'folder'
}
</script>

<template>
  <div class="dataset-details">
    <div class="action-row">
      <nuxt-link :to="backToFilesRoute" class="back-link">
        <IconArrowLeft class="back-link-icon" />
        <span>{{ backLinkLabel }}</span>
      </nuxt-link>
      <bf-button
        key="btn-get-dataset"
        class="get-dataset-button"
        @click="downloadFile"
      >
        {{ downloadContent }}
      </bf-button>
    </div>
    <public-archive-status
      class="archive-status"
      :archive="archive"
      :error="archiveError"
      :starting="starting"
      :signed-in="signedIn"
      @download="downloadArchive"
      @remove="removeArchive"
    />
      <div class="package-content">
        <el-table
          class="table"
          :data="store.selectedPackage.files"
          :highlight-current-row="false"
        >
          <el-table-column label="File Name">
            <template #default="scope">
              <div class="file-name-container">
                <img :src="useFileIcon(scope.row.icon, scope.row.type)" alt="" />
                <span class="name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="fileType" label="Type" width="120" />
          <el-table-column prop="size" label="Size" :formatter="formatStorage" width="120" />
          <el-table-column prop="uri" label="URI" min-width="240" />
        </el-table>
      </div>
  </div>
</template>

<style lang="scss" scoped>
.get-dataset-button {
  font-weight: 600;
  line-height: 16px;
  font-size: 14px;
  background-color: $purple_3;

  &:focus {
    background-color: $purple_3;
  }
}

.archive-status {
  margin-top: 12px;
  padding: 12px 16px;
  border: 1px solid $gray_2;
  border-radius: 4px;
}

.table {
  margin-top: 12px;

  .file-name-container {
    display: flex;
    align-items: center;
    gap: 8px;

    img {
      height: 18px;
      width: 18px;
      flex-shrink: 0;
    }

    .name {
      color: $text-color;
      word-break: break-word;
    }
  }
}

:deep(.el-table) {
  width: 100%;
  table-layout: fixed;

  .el-table__body-wrapper {
    border: solid 1px $cortex;
    border-top: none;
  }

  &::before {
    display: none;
  }

  th.is-leaf {
    background-color: $axon;
    color: #000;
    font-size: 14px;
    font-weight: 500;
    border-top: solid 1px $cortex;
    border-left: solid 1px $cortex;

    &:last-child {
      border-right: solid 1px $cortex;
    }
  }

  .el-table__header-wrapper {
    height: 40px;
  }

  td.el-table__cell {
    border-color: $cortex;
    border-right: none;
    font-size: 14px;
    color: $text-color;

    .cell {
      word-break: break-all;
      white-space: normal;
    }
  }
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: $purple_2;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  text-decoration: none;

  &:focus {
    color: $purple_2;
  }

  .back-link-icon {
    color: $purple_2;
    height: 10px;
    width: 10px;
    margin-right: 4px;
  }
}

.package-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
