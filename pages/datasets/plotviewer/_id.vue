<template>
  <div class="plot-viewer-page">
    <div class="page-wrap container">
      <detail-tabs
        :tabs="tabs"
        :active-tab="activeTab"
        class="container"
        @set-active-tab="activeTab = $event"
      >
        <client-only placeholder="Loading plot ...">
          <div class="plotvuer-container">
            <plot-vuer
              :data-source="{ url: source_url }"
              :metadata="metadata"
              :supplemental-data="supplemental_data"
            />
          </div>
        </client-only>
      </detail-tabs>
      <div class="subpage">
        <div class="page-heading">
          <h2>{{ fileName }}</h2>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">Type</strong>
          <div class="file-detail__column_2">
            {{ plotType.charAt(0).toUpperCase() + plotType.slice(1) }}
          </div>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">Dataset</strong>
          <div class="file-detail__column_2">
            <nuxt-link
              :to="{
                name: 'datasets-datasetId',
                params: {
                  datasetId
                }
              }"
            >
              {{ datasetTitle }}
            </nuxt-link>
          </div>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">File location</strong>
          <div class="file-detail__column_2">
            <nuxt-link
              :to="{
                name: `datasets-datasetId`,
                params: {
                  datasetId: datasetId
                },
                query: {
                  datasetDetailsTab: 'files',
                  path: fileFolderLocation
                }
              }"
            >
              {{ filePath }}
            </nuxt-link>
          </div>
        </div>
        <div class="pt-16">
          <bf-button @click="requestDownloadFile(file)">
            Download file
          </bf-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BfButton from '@/components/shared/BfButton/BfButton.vue'
import DetailTabs from '@/components/DetailTabs/DetailTabs.vue'

import scicrunch from '@/services/scicrunch'
import discover from '@/services/discover'

import DatasetInfo from '@/mixins/dataset-info'
import RequestDownloadFile from '@/mixins/request-download-file'
import FetchPennsieveFile from '@/mixins/fetch-pennsieve-file'
import FileDetails from '@/mixins/file-details'

import { extractS3BucketName } from '@/utils/common'

export default {
  name: 'PlotViewerPage',

  components: {
    DetailTabs,
    BfButton,
    PlotVuer: process.client
      ? () => import('@abi-software/plotvuer').then(m => m.PlotVuer)
      : null
  },

  mixins: [DatasetInfo, FileDetails, RequestDownloadFile, FetchPennsieveFile],

  async asyncData({ route, error, $axios, app }) {

    const datasetInfo = await DatasetInfo.methods.getDatasetInfo(
      $axios,
      route.query.dataset_id,
      route.query.dataset_version,
      app.$cookies.get('user-token')
    )

    const s3Bucket = datasetInfo ? extractS3BucketName(datasetInfo.uri) : undefined

    const identifier = route.query.identifier

    const scicrunchResponse = await scicrunch.getDatasetInfoFromObjectIdentifier(
      identifier
    )
    const scicrunchData = scicrunchResponse.data.result[0]
    const matchedData = scicrunchData['abi-plot'].filter(function(el) {
      return el.identifier === identifier
    })

    const plot_info = matchedData[0]
    const plot_annotation = plot_info.datacite
    const file_path = `${route.query.dataset_id}/${route.query.dataset_version}/files/${plot_info.dataset.path}`
    const source_url_response = await discover.downloadLink(file_path, s3Bucket)
    let source_url = source_url_response.data

    const filePath = `files/${plot_info.dataset.path}`
    const file = await FetchPennsieveFile.methods.fetchPennsieveFile(
      $axios,
      filePath,
      route.query.dataset_id,
      route.query.dataset_version,
      error
    )

    const metadata = JSON.parse(
      plot_annotation.supplemental_json_metadata.description
    )

    let supplemental_data = []
    if (plot_annotation.isDescribedBy) {
      let tmp_path = plot_annotation.isDescribedBy.path
      // Hack to fix path entry.
      if (tmp_path === '../derivative/sub-1/subject1_header.txt') {
        tmp_path = 'derivative/sub-1/sam-1/subject1_header.txt'
      }

      const supplemental_file_path = `${route.query.dataset_id}/${route.query.dataset_version}/files/${tmp_path}`

      const supplemental_url_response = await discover.downloadLink(
        supplemental_file_path,
        s3Bucket
      )
      let supplemental_url = supplemental_url_response.data
      supplemental_data.push({
        url: supplemental_url
      })
    }

    return {
      source_url,
      metadata,
      supplemental_data,
      plot_info,
      file,
      datasetInfo
    }
  },

  data: () => {
    return {
      tabs: [
        {
          label: 'Plot Viewer',
          type: 'plot'
        }
      ],
      activeTab: 'plot'
    }
  },
  computed: {
    /**
     * Get the dataset id from the query parameter.
     * @returns Number
     */
    datasetId: function() {
      return this.$route.query.dataset_id
    },

    /**
     * Get the version number from the query parameter.
     * @returns Number
     */
    versionNumber: function() {
      return this.$route.query.dataset_version
    },

    plotType: function() {
      return this.metadata.attrs.style
    },
    /**
     * Return the dataset's name.
     * @returns String
     */
    datasetTitle: function() {
      return this.datasetInfo ? this.datasetInfo.name : 'Go to dataset'
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/_viewer.scss';
</style>
<style lang="scss">
.plotvuer-container {
  margin-top: 1.5rem;
  height: 90vh;
  max-width: calc(100% - 48px);
  @import '~@abi-software/plotvuer/dist/plotvuer';
}
.page-heading {
  margin-bottom: 1.375rem;
}
</style>
