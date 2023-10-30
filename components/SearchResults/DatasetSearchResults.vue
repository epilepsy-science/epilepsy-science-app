<template>
  <el-table
    :data="tableData"
    :show-header="false"
    empty-text="No Results"
  >
  
    <el-table-column prop="banner" label="Image" width="160">
      <template slot-scope="scope">
          <nuxt-link
            :to="{
              name: 'datasets-datasetId',
              params: { datasetId: scope.row.id },
              query: {
                type: getSearchResultsType(scope.row)
              }
            }"
            class="img-dataset"
          >   
            <img
              v-if="scope.row.banner"
              :src="scope.row.banner"
              :alt="`Banner for ${scope.row.name}`"
              height="128"
              width="128"
            />
            <sparc-pill v-if="scope.row.embargo">
              Embargoed
            </sparc-pill>
          </nuxt-link>
      </template>
    </el-table-column>
    <el-table-column
      min-width="400"
    >
      <template slot-scope="scope">

          <nuxt-link
            :to="{
              name: 'datasets-datasetId',
              params: { datasetId: scope.row.id },
              query: {
                type: getSearchResultsType(scope.row)
              }
            }"
            v-html="scope.row.name"
          />
          <div
            class="my-8"
          />
          <table class="property-table">
            <tr
              v-for="(property, index) in PROPERTY_DATA"
              v-show="getPropertyValue(scope.row, property)"
              :key="index"
            >
              <td class="property-name-column">
                {{ property.displayName }}
              </td>
              <td
                v-html="getPropertyValue(scope.row, property)"
              />
            </tr>
          </table>

      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import SparcPill from '@/components/SparcPill/SparcPill.vue'
import FormatDate from '@/mixins/format-date'
import StorageMetrics from '@/mixins/bf-storage-metrics'
import _ from 'lodash'
import { HIGHLIGHT_HTML_TAG } from '~/pages/data/utils'

export default {
  name: 'DatasetSearchResults',

  components: { SparcPill },

  mixins: [FormatDate, StorageMetrics],

  props: {
    tableData: {
      type: Array,
      default: () => []
    },
  },

  data() {
    return {
      PROPERTY_DATA: [
        {
          displayName: 'Description',
          propPath: 'description'
        },
        {
          displayName: 'Experimental Approach',
          propPath: '_highlightResult.item.modalities'
        },
        {
          displayName: 'Publication Date',
          propPath: 'pennsieve'
        },
        {
          displayName: 'Samples',
          propPath: 'item.statistics'
        }
      ]
    }
  },

  methods: {
    toTermUppercase: function(term) {
      let value = _.upperFirst(term)
      if (value.indexOf(`<${HIGHLIGHT_HTML_TAG}>`) === 0) {
        // If first word is a search term coincidence, set first letter to uppercase
        value = value.slice(0, 3) + value.charAt(3).toUpperCase() + value.slice(4)
      }
      return value
    },
    getPropertyValue: function(item, property) {
      if (item == undefined) {
        return undefined
      }
      switch (property.displayName) {
        case 'Name': {
          return item.name
        }
        case 'Description': {
          return item.description
        }
        case 'Samples': {
          const sampleCount = _.get(item, property.propPath + '.samples.count')
          const subjectCount = _.get(
            item,
            property.propPath + '.subjects.count'
          )
          return sampleCount && subjectCount
            ? `${sampleCount} samples from ${subjectCount} subjects`
            : undefined
        }
        case 'Experimental Approach': {
          const techniques = _.get(item, property.propPath)
          return techniques
            ? techniques
                .map(item => this.toTermUppercase(item.keyword.value))
                .join(', ')
            : undefined
        }
        case 'Publication Date': {
          if (item.versionPublishedAt == undefined || item.versionPublishedAt == undefined) {
            return undefined
          }
          const createdAt = item.versionPublishedAt.split(",")[0]
          const updatedAt = item.updatedAt.split(",")[0]
          return this.formatDate(createdAt) +
                    ' (Last updated ' +
                    this.formatDate(updatedAt) +
                    ')'
        }
        default: {
          return _.upperFirst(item)
        }
      }
    },
    getSearchResultsType(item) {
      return 'dataset'
      // return item !== undefined ? 
      //   (item.types[0].name === 'computational model' ? 'simulation' : 'dataset') :
      //   ''
    }
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  width: 100%;
}

.el-table--enable-row-hover .el-table__body tr {
  background-color: transparent;
}

.img-dataset {
  display: block;
  position: relative;
  .sparc-pill {
    font-size: 0.75rem;
    position: absolute;
    right: 0.25rem;
    top: 0.5rem;
  }
  img {
    display: block;
  }
}
.property-table {
  td {
    background-color: transparent;
    padding: 0.25rem 0 0 0;
    border: none;
  }
  background-color: transparent;
  border: none;
  padding: 0;
}
// The outermost bottom border of the table. Element UI adds psuedo elements to create the bottom table border that we must hide to remove
table:not([class^='el-table__'])::before {
  display: none;
}
.property-name-column {
  width: 180px;
  font-weight: bold;
}
</style>
