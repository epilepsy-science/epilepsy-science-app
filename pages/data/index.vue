<template>

  <Head>
    <Title>{{ searchType.label }}</Title>
    <Meta name="og:title" hid="og:title" :content="title" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="description" hid="description" :content="`Browse ${title}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${title}`" />
    <Meta name="twitter:description" :content="`Browse ${title}`" />
  </Head>
  <div class="page-data">
    <section class="data-hero es-dots">
      <div class="data-hero__inner">
        <p class="es-label">Data</p>
        <h1 class="data-hero__title">{{ isIndividualScope ? 'Individual published datasets' : 'All datasets' }}</h1>
        <div class="es-heading-bar centered"><i></i></div>
        <p class="data-hero__text">
          {{ isIndividualScope
            ? 'Datasets published independently of a research project.'
            : 'Search every published dataset by keyword, then refine by tags, contributors, or availability.' }}
        </p>
        <DataBrowseTabs active="all" class="mb-24" />
        <div class="data-hero__search">
          <search-controls-contentful class="search-bar" placeholder="Find a dataset..." showSearchText />
        </div>
        <NuxtLink v-if="isIndividualScope" class="scope-chip" :to="{ query: { ...$route.query, scope: undefined } }">
          Not part of a project · Show all ✕
        </NuxtLink>
      </div>
    </section>
    <div class="container">
      <el-row :gutter="32" type="flex">
        <el-col :span="24">
          <el-row :gutter="32">
            <el-col class="facet-menu" :sm="24" :md="8" :lg="6">
              <client-only>
                <dataset-facet-menu :facets="facets" :visible-facets="visibleFacets"
                  @selected-facets-changed="onFacetSelectionChange()" @hook:mounted="facetMenuMounted"
                  ref="datasetFacetMenu" />
              </client-only>
            </el-col>
            <el-col :sm="searchColSpan('sm')" :md="searchColSpan('md')" :lg="searchColSpan('lg')">
              <div v-show="!isLoadingSearch && searchData.items.length" class="search-heading">
                <div class="results-summary">
                  <strong>{{ searchData.total.toLocaleString() }}</strong>
                  {{ searchData.total === 1 ? 'dataset' : 'datasets' }}
                  <template v-if="latestSearchTerm"> for “{{ latestSearchTerm }}”</template>
                </div>
                <client-only>
                  <div class="datasets-count">
                    <span>Per page</span>
                    <el-select class="el-select-wrapper" v-model="searchData.limit" size="small"
                      @change="updateDataSearchLimit">
                      <el-option v-for="(item, index) in itemsToDisplay" :key="index" :label="item" :value="item" />
                    </el-select>
                  </div>
                </client-only>
                <client-only>
                  <div class="pagination-wrapper">
                    <el-pagination v-if="searchData.limit < searchData.total" :current-page="curSearchPage"
                      :page-size="searchData.limit" :total="searchData.total" layout="prev, pager, next"
                      :pager-count="5" @current-change="onPaginationPageChange" />
                  </div>
                </client-only>
              </div>
              <div v-loading="isLoadingSearch" class="table-wrapper">
                <p v-if="searchFailed" class="search-error">
                  Sorry, the search engine has encountered an unexpected
                  error, please try again later.
                </p>
                <component :is="DatasetCard" v-for="dataset in tableData" class="mb-16" :key="dataset.id"
                  :dataset="dataset"></component>
              </div>
              <div class="dataset-results-footer">
                <client-only>
                  <el-pagination v-if="searchData.limit < searchData.total" :current-page="curSearchPage"
                    :page-size="searchData.limit" :total="searchData.total" layout="prev, pager, next"
                    :pager-count="5" @current-change="onPaginationPageChange" />
                </client-only>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import {
  compose,
  defaultTo,
  head,
  mergeLeft,
  pathOr,
  propOr
} from 'ramda'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import DatasetFacetMenu from '@/components/FacetMenu/DatasetFacetMenu.vue'
import { facetPropPathMapping, getAlgoliaFacets } from '../../utils/algolia'
import { HIGHLIGHT_HTML_TAG } from '../../utils/utils'
import { markRaw } from 'vue'

const searchTypes = [
  {
    label: 'Datasets',
    type: 'dataset',
  },
  {
    label: 'Anatomical Models',
    type: 'model',
  },
  {
    label: 'Computational Models',
    type: 'simulation',
  }
]

export default {
  name: 'DataPage',

  components: {
    SearchControlsContentful,
    DatasetFacetMenu,
  },

  async setup() {
    const config = useRuntimeConfig()
    const route = useRoute()
    const { $algoliaClient } = useNuxtApp()
    // Nuxt composables must be called before the first await in an async setup
    const { excludeFilter } = useProjectDatasetIds()
    const isIndividualScope = computed(() => route.query.scope === 'individual')
    useBreadcrumb(computed(() => [
      { label: 'Data', to: '/projects' },
      { label: isIndividualScope.value ? 'Individual datasets' : 'All datasets' },
    ]))
    const algoliaIndex = await $algoliaClient.initIndex(config.public.ALGOLIA_INDEX)

    const searchType = searchTypes.find(searchType => {
      return searchType.type == route.query.type
    })
    const title = propOr('', 'label', searchType)

    // ?scope=individual hides datasets that belong to a project collection
    const projectExcludeFilter = ref('')
    async function loadScopeFilter() {
      projectExcludeFilter.value = isIndividualScope.value ? await excludeFilter() : ''
    }
    await loadScopeFilter()
    return {
      algoliaIndex,
      projectExcludeFilter,
      isIndividualScope,
      loadScopeFilter,
      title
    }
  },

  data: () => {
    return {
      searchQuery: '',
      searchData: {
        limit: 10,
        skip: 0,
        items: [],
        total: 0
      },
      itemsToDisplay: [10,25,50,100],
      facets: [],
      visibleFacets: {},
      isLoadingSearch: false,
      searchFailed: false,
      isSearchMapVisible: false,
      latestSearchTerm: '',
      searchTypes: searchTypes,
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        },
        {
          to: {
            name: 'data',
            query: {
              type: 'dataset'
            }
          },
          label: 'Data & Models'
        },
      ],
      titleColumnWidth: 300,
      windowWidth: '',
      DatasetCard: null
    }
  },

  computed: {
    searchType: function () {
      const searchTypeQuery = pathOr('', ['query', 'type'], this.$route)
      const searchType = this.searchTypes.find(searchType => {
        return searchType.type == searchTypeQuery
      })

      return defaultTo(head(this.searchTypes), searchType)
    },

    tableData: function () {
      return propOr([], 'items', this.searchData)
    },

    searchResultsComponent: function () {
      return defaultTo('', searchResultsComponents[this.$route.query.type])
    },

    curSearchPage: function () {
      return this.searchData.skip / this.searchData.limit + 1
    },

    searchHeading: function () {
      const query = pathOr('', ['query', 'search'], this.$route)

      const searchType = this.searchTypes.find(searchType => {
        return searchType.type == this.$route.query.type
      })
      const searchTypeLabel = propOr('', 'label', searchType)

      let searchHeading = `${this.searchData.total} ${searchTypeLabel}`

      return query === '' ? searchHeading : `${searchHeading} for “${query}”`
    },

    search: function () {
      return this.$route.query.search || ''
    },

    isMobile: function () {
      return this.windowWidth <= 500
    }
  },

  watch: {
    '$route.query.type': function (val) {
      if (!this.$route.query.type) {
        return
      } else {
        this.searchData = {
          limit: 10,
          skip: 0,
          items: [],
          total: 0
        }
        this.fetchResults()
      }
    },

    '$route.query.scope': function () {
      this.loadScopeFilter().then(() => this.fetchResults())
    },
    '$route.query.search': {
      handler: function () {
        this.searchQuery = this.$route.query.search
        this.fetchResults()
      },
      immediate: true
    }
  },

  beforeMount: function () {
    this.windowWidth = window.innerWidth
  },
  mounted: async function () {
    const module = await import('pennsieve-ui-library');
    this.DatasetCard = markRaw(module.DatasetCard);
    if (!this.$route.query.type) {
      const firstTabType = compose(propOr('', 'type'), head)(searchTypes)
      this.$router.replace({ query: { type: firstTabType } })
    } else {
      const queryParams = {
        skip: Number(this.$route.query.skip || this.searchData.skip),
        limit: Number(this.$route.query.limit || this.searchData.limit),
        search: this.$route.query.search || ''
      }

      this.searchData = { ...this.searchData, ...queryParams }
    }
    if (window.innerWidth <= 768) this.titleColumnWidth = 150
    window.onresize = () => this.onResize(window.innerWidth)
    getAlgoliaFacets(this.algoliaIndex, facetPropPathMapping)
      .then(data => {
        this.facets = data
      })
      .finally(() => {
        this.fetchResults()
      })
  },

  methods: {
    updateDataSearchLimit: function (limit) {
      this.searchData.skip = 0

      const newLimit = limit === 'View All' ? this.searchData.total : limit

      this.searchData.limit = newLimit
      this.$router.replace({
        query: { ...this.$route.query, limit: newLimit, skip: 0 }
      })
      this.fetchResults()
    },

    facetMenuMounted: function () {
      this.fetchResults()
    },

    fetchResults: function () {
      this.isLoadingSearch = true
      this.searchFailed = false
      const query = this.$route.query.search

      const searchType = pathOr('dataset', ['query', 'type'], this.$route)

      /* First we need to find only those facets that are relevant to the search query.
       * If we attempt to do this in the same search as below than the response facets
       * will only contain those specified by the filter */
      this.latestSearchTerm = query
      this.algoliaIndex
        .search(query, {
          facets: ['*'],
        })
        .then(response => {
          this.visibleFacets = response.facets
        })
        .catch(() => {
          this.isLoadingSearch = false
          this.searchFailed = true
        })
        .finally(() => {
          const facetFilters = this.$refs.datasetFacetMenu?.getFilters() || ''
          const filters = [facetFilters, this.projectExcludeFilter]
            .filter(Boolean)
            .map(f => `(${f})`)
            .join(' AND ')

          this.algoliaIndex
            .search(query, {
              facets: ['*'],
              hitsPerPage: this.searchData.limit,
              page: this.curSearchPage - 1,
              filters: filters,
              attributesToHighlight: [
                'item.name',
                'item.description',
              ],
              highlightPreTag: `<${HIGHLIGHT_HTML_TAG}>`,
              highlightPostTag: `</${HIGHLIGHT_HTML_TAG}>`
            })
            .then(response => {
              const searchData = {
                items: response.hits,
                total: response.nbHits
              }
              this.searchData = mergeLeft(searchData, this.searchData)
              this.isLoadingSearch = false
            })
            .catch(() => {
              this.isLoadingSearch = false
              this.searchFailed = true
            })
        })
    },

    onFacetSelectionChange: function () {
      this.searchData.skip = 0
      this.fetchResults()
    },

    onPaginationPageChange: function (page) {
      const offset = (page - 1) * this.searchData.limit
      this.searchData.skip = offset

      this.$router.replace({
        query: { ...this.$route.query, skip: offset }
      })

      this.fetchResults()
    },

    onResize: function (width) {
      width <= 768
        ? (this.titleColumnWidth = 150)
        : (this.titleColumnWidth = 300)
      this.windowWidth = width
    },

    searchColSpan(viewport) {
      const viewports = {
        sm: 24,
        md: 16,
        lg: 18
      }

      return viewports[viewport] || 24
    }
  }
}
</script>

<style scoped lang="scss">
.data-hero {
  border-bottom: 1px solid $es-border;

  &__inner {
    max-width: 760px;
    margin: 0 auto;
    padding: 64px 20px 40px;
    text-align: center;
  }

  .es-label { margin: 0 0 12px; }

  &__title {
    margin: 0;
    font-size: 2.25rem;
    font-weight: 500;
    color: #000;
    text-transform: uppercase;
  }

  .es-heading-bar { margin-bottom: 16px; }

  &__text {
    margin: 0 auto 24px;
    font-size: 1.05rem;
    line-height: 1.6;
    color: #333;
  }

  &__search {
    max-width: 640px;
    margin: 0 auto;

    :deep(.el-input__wrapper) {
      border-radius: $es-radius-sm 0 0 $es-radius-sm;
      box-shadow: 0 0 0 1px $es-border inset;
      padding: 6px 12px;
      background: #fff;
    }
    :deep(.input-wrap) { margin-right: 0; }
    :deep(.el-button) {
      height: auto;
      border-radius: 0 $es-radius-sm $es-radius-sm 0;
      border: 1px solid $es-cta;
      background: $es-cta;
      color: #fff;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
      &:hover { background: $es-cta-hover; border-color: $es-cta-hover; }
    }
  }
}

.scope-chip {
  display: inline-block;
  margin-top: 16px;
  padding: 4px 12px;
  border: 1px solid $es-teal;
  border-radius: $es-radius-sm;
  background: #fff;
  color: $es-teal;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  &:hover { background: $es-teal; color: #fff; }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.table-wrapper {
  margin-top: 16px;

  .search-error {
    margin: 0 0 auto;
    text-align: center;
  }
}

.search-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }

  .results-summary {
    font-size: 0.95rem;
    color: #333;
    strong { color: $es-teal; font-size: 1.1rem; }
  }

  .datasets-count {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: #555;
  }

  .el-select-wrapper {
    margin-left: 8px;
    width: 64px;
    :deep(.el-select__wrapper) { border-radius: $es-radius-sm; }
  }

  .pagination-wrapper { display: none; }
}

.dataset-results-footer {
  display: flex;
  justify-content: center;
  margin: 24px 0 16px;
}

:deep(.el-pagination) {
  --el-pagination-button-bg-color: #fff;
  .el-pager li, button {
    border: 1px solid $es-border;
    border-radius: $es-radius-sm;
    margin: 0 3px;
    min-width: 32px;
    &.is-active { background: $es-teal; border-color: $es-teal; color: #fff; }
  }
}

:deep(.el-table td) { vertical-align: top; }
:deep(.el-table .cell) { word-break: normal; }

@media (max-width: 768px) {
  .data-hero__inner { padding: 40px 16px 32px; }
  .data-hero__title { font-size: 1.6rem; }
  .container { padding: 24px 16px 40px; }
}
</style>
