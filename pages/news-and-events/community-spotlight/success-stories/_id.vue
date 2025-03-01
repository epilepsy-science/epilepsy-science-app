<template>
  <div class="events-page">
    <breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <page-hero>
      <h1>{{ title }}</h1>
      <br />
      <p>
        {{ entry.summary }}
      </p>
    </page-hero>
    <div class="page-wrap container pb-24">
      <div class="subpage">
        <el-row :gutter="38">
          <el-col :sm="13">
            <div
              class="content"
              v-html="parseMarkdown(entry.story)"
            />
          </el-col>
          <el-col :sm="11">
            <div class="banner-wrapper">
              <iframe
                v-if="entry.youtubeUrl"
                class="banner-asset"
                :src="embeddedVideoSrc"
                allowfullscreen
                allowtransparency
                allow="autoplay"
                frameBorder="0"
              />
              <img
                v-else-if="entry.files"
                class="banner-asset"
                :src="entry.files[0].fields.file.url"
                :alt="entry.files[0].description"
              />
            </div>
            <div class="seperator-path my-32" />
            <div class="label4">
              AUTHOR
            </div>
            <div class="content body4">
              {{ author }}
            </div>
            <br />
            <template v-if="entry.publishedDate">
              <div class="label4">
                PUBLISHED DATE
              </div>
              <div class="content body4">
                {{ formatDate(entry.publishedDate) }}
              </div>
              <br />
            </template>
            <template v-if="entry.contributorsMarkdown">
              <div class="label4">
                TEAM MEMBERS
              </div>
              <div class="content body4" v-html="parseMarkdown(entry.contributorsMarkdown)" />
              <br />
            </template>
            <template v-if="entry.referencesMarkdown">
              <div class="label4">
                SUPPORTING INFORMATION
              </div>
              <div class="content body4" v-html="parseMarkdown(entry.referencesMarkdown)" />
              <br />
            </template>
            <div class="label4">
              Share
            </div>
            <share-links />
            <div class="seperator-path my-32" />
            <template v-if="entry.associatedDatasets">
              <div class="label4">
                ASSOCIATED DATASETS
              </div>
              <br />
              <div
                v-for="(datasetUrl, index) in entry.associatedDatasets"
                :key="'dataset' + index"
                class="body4 "
              >
                <dataset-card :id="datasetIdFromUrl(datasetUrl)" />
              </div>
            </template>
          </el-col>
        </el-row>
      </div>
      <nuxt-link
        class="btn-load-more mt-16"
        :to="{
          name: 'news-and-events-community-spotlight-success-stories'
        }"
      >
        View All Success Stories &gt;
      </nuxt-link>
      <div class="subpage">
        Have something to share with the community? We would love to hear from you! Submit your success story
        <nuxt-link to="/news-and-events/community-spotlight/submit">
          here
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import { successMessage, failMessage } from '@/utils/notification-messages'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'
import PageHero from '@/components/PageHero/PageHero.vue'
import DatasetCard from '@/components/DatasetCard/DatasetCard.vue'
import createClient from '@/plugins/contentful.js'
import youtubeEmbeddedSource from '@/mixins/youtube-embedded-src'
import MarkedMixin from '@/mixins/marked'
import FormatDate from '@/mixins/format-date'
import ShareLinks from '~/components/ShareLinks/ShareLinks.vue'

const client = createClient()

export default {
  name: 'StoryPage',
  components: {
    DatasetCard,
    Breadcrumb,
    PageHero,
    ShareLinks
},
  mixins: [FormatDate, MarkedMixin],
  async asyncData({ route }) {
    try {
      const results = await client.getEntries({
        content_type: 'successStoryDisplay',
        'fields.storyRoute[match]': route.params.id,
        include: 1,
        order: '-fields.publishedDate',
      })
      return {
        entry: results.items[0].fields,
        slug: route.params.slug,
        title: results.items[0].fields.storyTitle
      }
    } catch (error) {
      return {
        title: '',
        entry: {},
        slug: ''
      }
    }
  },
  data: function() {
    return {
      title: '',
      entry: {},
      slug: '',
      breadcrumb: [
        {
          label: 'Home',
          to: {
            name: 'index'
          }
        },
        {
          label: 'News & Events',
          to: {
            name: 'news-and-events'
          }
        },
        {
          label: 'Community Spotlight',
          to: {
            name: 'news-and-events-community-spotlight'
          }
        },
        {
          label: 'Success Stories',
          to: {
            name: 'news-and-events-community-spotlight-success-stories'
          }
        }
      ]
    }
  },
  head() {
    return {
      title: this.title,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.title,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.entry.summary ? this.entry.summary : 'Stimulating Peripheral Activity to Relieve Conditions (SPARC)'
        },
      ]
    }
  },
  computed: {
    pageUrl: function() {
      return `${process.env.ROOT_URL}${this.$route.fullPath}`
    },
    embeddedVideoSrc: function() {
      return youtubeEmbeddedSource(this.entry.youtubeUrl)
    },
    author: function(){
      if (this.entry.name) return this.entry.name
      if (this.entry.author) return this.entry.author
      else return ''
    }
  },
  methods: {
    // Retrieve dataset id form sparc.science, discover.pennsieve, or just the id
    datasetIdFromUrl: function(url) {
      if (!url.includes('/')) return Number(url)
      let datasetId = url.split('/').pop()
      if (datasetId.includes('?')) datasetId = datasetId.split('?')[0]
      return Number(datasetId)
    },
    copyLink: function() {
      this.$copyText(this.pageUrl).then(
        () => {
          this.$message(successMessage('Share link copied to clipboard.'))
        },
        () => {
          this.$message(failMessage('Failed to copy share link.'))
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@nih-sparc/sparc-design-system-components/src/assets/_variables.scss';
.events-page {
  background-color: $background;
}
.page-wrap {
  max-width: 66.75rem;
  @media (max-width: 48em) {
    width: auto;
  }
}

.banner-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}

.banner-wrapper .banner-asset {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.iframe-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  min-width: 25.68rem;
}

// Used for sizing iframes that are in the content

.content {
  & ::v-deep {
    color: $grey;
  }
  & ::v-deep p {
    margin-bottom: 1em;
  }
  & ::v-deep img {
    height: auto;
    margin: 0.5em 0;
    max-width: 100%;
  }
  & ::v-deep iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  & ::v-deep video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  @media (max-width: 48em) {
    margin-bottom: 2rem;
  }
}

.seperator-path {
  width: 100%;
  height: 0.125rem;
  background: $lineColor1;
  border-radius: 0px;
}

.btn-copy-permalink {
  border: none;
  background: none;
  color: $purple;
  cursor: pointer;
  padding: 0;
  &:active {
    outline: none;
  }
}

.header {
  margin-bottom: 3em;
  .updated {
    color: #aaa;
  }
}

.btn-load-more {
  background: none;
  border: none;
  color: $darkBlue;
  cursor: pointer;
  display: block;
  font-size: 1rem;
  font-weight: 700;
  padding: 0;
  &:hover,
  &:active {
    text-decoration: underline;
  }
}

.subpage {
  margin-bottom: 0 !important;
}
</style>
