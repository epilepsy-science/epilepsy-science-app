<template>
  <div class="story-result">
    <div>
      <div class="banner-wrapper">
        <client-only
          v-if="story.fields.youtubeUrl"
          placeholder="Loading video ..."
        >
          <iframe
            class="banner-asset"
            :src="embeddedVideoSrc"
            allowfullscreen
            allowtransparency
            allow="autoplay"
            frameBorder="0"
          />
        </client-only>
        <img
          v-else-if="story.fields.files && story.fields.files[0].fields.file.contentType.includes('image')"
          class="banner-asset"
          :src="story.fields.files[0].fields.file.url"
          :alt="story.fields.files[0].description"
        />
        <video
          v-else-if="story.fields.files && story.fields.files[0].fields.file.contentType.includes('video')"
          class="banner-asset"
          controls=""
          autoplay="false"
          name="media"
        >
          <source :src="story.fields.files[0].fields.file.url" :type="story.fields.files[0].fields.file.contentType">
        </video>
      </div>
    </div>
    <div class="story-text">
      <div class="link1 mb-8">
        <nuxt-link
          v-if="story.fields.storyRoute"
          :to="{
            name: 'news-and-events-community-spotlight-success-stories-id',
            params: { id: story.fields.storyRoute, contentfulId: story.sys.id }
          }"
          v-html="highlightMatches(story.fields.storyTitle, $route.query.search)"
        />
        <a v-else-if="story.fields.youtubeUrl" :href="story.fields.youtubeUrl" target="_blank">
          <span v-html="highlightMatches(story.fields.storyTitle, $route.query.search)"/><svg-icon name="icon-open" height="30" width="30" />
        </a>
      </div>
      <div class="body1">
        {{ story.fields.summary }}
      </div>
      <table v-if="story.spotlightType" class="property-table mt-8">
        <tr>
          <td class="property-name-column">
            Spotlight Type
          </td>
          <td>
            {{ story.spotlightType }}
          </td>
        </tr>
        <tr>
          <td class="property-name-column">
            Focus
          </td>
          <td>
            {{ anatomicalStructureText }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import youtubeEmbeddedSource from '@/mixins/youtube-embedded-src'
import { highlightMatches } from '../../pages/data/utils'

export default {
  name: 'CommunitySpotlightItem',
  props: {
    story: {
      type: Object,
      default: () => {}
    },
  },
  computed: {
    embeddedVideoSrc: function() {
      return youtubeEmbeddedSource(this.story.fields.youtubeUrl)
    },
    anatomicalStructureText: function() {
      return this.story.anatomicalStructures ? this.story.anatomicalStructures.join(', ') : 'n/a'
    }
  },
  methods: {
    highlightMatches
  }
}
</script>

<style lang="scss" scoped>

.banner-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  width: 12rem;
}

.banner-wrapper .banner-asset {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
}

.story-result {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  min-height: 10.875rem;
  width: 100%;
}

.story-text {
  flex: 1.2;
  min-width: 17.5rem;
  @media (max-width: 48em) {
    margin: 1rem 0 0;
  }
}

.el-table {
  width: 100%;
}
.property-table {
  td {
    background-color: transparent !important;
    padding: 0.25rem 0 0 0;
    border: none;
    cursor: default;
  }
  border: none;
  padding: 0;
  padding-bottom: 1rem;
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
