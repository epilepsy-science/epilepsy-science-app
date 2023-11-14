<template>
  <div class="page-data">
    <breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <page-hero>
      <h1>{{ page.fields.page_title }}</h1>
      <!-- eslint-disable vue/no-v-html -->
      <!-- marked will sanitize the HTML injected -->
      <div v-html="parseMarkdown(page.fields.heroCopy)" />
      <img
        v-if="page.fields.heroImage"
        slot="image"
        class="page-hero-img"
        :src="page.fields.heroImage.fields.file.url"
      />
      <NuxtLink to="/news-and-events/news">
        <el-button class="secondary mb-16">Browse all News &amp; Events</el-button>
      </NuxtLink>
    </page-hero>

    <div class="pt-32 pb-16">
      <div class="container">
        <div v-if="Object.keys(featuredEvent).length" class="mb-48">
          <div class="heading2 mb-16">Featured Event</div>
          <featured-event :event="featuredEvent" />
        </div>

        <el-row :gutter="32">
          <el-col class="mb-16" :sm="12">
            <div class="heading2 mb-16">Latest News</div>
            <div class="subpage news-wrap">
              <div>
                <news-list-item v-for="newsItem in news.items" :key="newsItem.sys.id" :item="newsItem" />

                <nuxt-link
                  class="btn-load-more mt-16"
                  :to="{
                    name: 'news-and-events-news'
                  }"
                >
                  View All News
                </nuxt-link>
              </div>
            </div>
          </el-col>
          <el-col :sm="12">
            <div class="heading2 mb-16">Events</div>
            <!--
              Server side rendering does not work with the following
              combination of components
            -->
            <client-only>
              <content-tab-card
                class="tabs p-32"
                :tabs="eventsTabs"
                :active-tab-id="activeTabId"
                @tab-changed="eventsTabChanged"
              >
                <template v-if="activeTabId === 'upcoming'">
                  <div class="upcoming-events">
                    <event-card
                      v-for="event in upcomingEvents.items"
                      :key="event.sys.id"
                      :event="event"
                    />
                  </div>

                </template>

                <template v-if="activeTabId === 'past'">
                  <div class="past-events">
                    <event-card
                      v-for="event in pastEvents.items"
                      :key="event.sys.id"
                      :event="event"
                    />
                  </div>
                </template>
                <div class="mt-16">
                  <nuxt-link
                    class="btn-load-more"
                    :to="{
                      name: 'news-and-events-events',
                    }"
                  >
                    View All Events
                  </nuxt-link>
                </div>
              </content-tab-card>
            </client-only>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue';
import TabNav from '@/components/TabNav/TabNav.vue';
import EventListItem from '@/components/EventListItem/EventListItem.vue';
import NewsListItem from '@/components/NewsListItem/NewsListItem.vue';
import EventCard from '@/components/EventCard/EventCard.vue';
import PageHero from '@/components/PageHero/PageHero.vue';
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue';
import NewsletterForm from '@/components/NewsletterForm/NewsletterForm.vue';
import FeaturedEvent from '@/components/FeaturedEvent/FeaturedEvent.vue';
import CommunitySpotlightListings from '~/components/CommunitySpotlight/CommunitySpotlightListings.vue';

import ErrorMessages from '@/mixins/error-messages'
import MarkedMixin from '@/mixins/marked'

import createClient from '@/plugins/contentful.js';

import { Computed, Data, Methods, fetchData, fetchNews, PageEntry, NewsAndEventsComponent, NewsCollection, EventsCollection, CommunitySpotlightItemsCollection } from './model';

const client = createClient()

export default Vue.extend<Data, Methods, Computed, never>({
  name: 'NewsAndEventPage',

  mixins: [
    MarkedMixin
  ],

  components: {
    Breadcrumb,
    EventCard,
    EventListItem,
    PageHero,
    NewsListItem,
    TabNav,
    SearchControlsContentful,
    NewsletterForm,
    FeaturedEvent,
    CommunitySpotlightListings
  },

  asyncData({ error }) {
    try {
      return fetchData(client, '', 2)
    }
    catch(e) {
      //Handle uncaught error
      console.error(e)
      const message = ErrorMessages.methods.contentful()
      return error({ statusCode: 400, message: message, display: true, error: e})
    }
  },

  watch: {
    '$route.query': {
      handler: async function(this: NewsAndEventsComponent) {
        const { upcomingEvents, pastEvents, news, page, stories } = await fetchData(client, this.$route.query.search as string, 2)
        this.upcomingEvents = upcomingEvents;
        this.pastEvents = pastEvents;
        this.news = news;
        this.page = page;
        this.stories = stories;
      },
      immediate: true
    }
  },

  data: function() {
    return {
      title: 'News & Events',
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        }
      ],
      activeTabId: 'upcoming',
      eventsTabs: [
        {
          label: 'Upcoming',
          id: 'upcoming'
        },
        {
          label: 'Past',
          id: 'past'
        }
      ],
      upcomingEvents: {} as EventsCollection,
      pastEvents: {} as EventsCollection,
      news: {} as NewsCollection,
      page: {} as PageEntry,
      stories: {} as CommunitySpotlightItemsCollection
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
          content: this.page.fields.heroCopy ? this.page.fields.heroCopy : 'Stimulating Peripheral Activity to Relieve Conditions (SPARC)'
        },
      ]
    }
  },

  computed: {
    /**
     * Compute featured event
     * @returns {Object}
     */
    featuredEvent: function() {
      return this.page.fields.featuredEvent || {}
    },
  },

  methods: {
    /**
     * Get all news
     */
    getAllNews: async function() {
      const news = await fetchNews(client, this.$route.query.search as string, undefined, undefined, undefined, undefined, this.news.total, 2)
      this.news = { ...this.news, items: { ...this.news.items, ...news.items } }
    },
    eventsTabChanged(newTab) {
      this.activeTabId = newTab.id
    },
    // Calculate the eventYear param based off the tab being shown
    eventYear() {
      if (this.activeTabId === 'upcoming')
      {

      }
      else if (this.activeTabId === 'past') {

      }
      return undefined
    },
    currentMonth() {
      return new Date().getMonth()
    }
  },

  mounted() {
  }
})
</script>

<style lang="scss" scoped>
@import '@nih-sparc/sparc-design-system-components/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
.heading1 {
  font-weight: 300;
}
.subpage {
  margin: 0;
}
.event-card {
  margin-bottom: 2em;
}
::v-deep .details-tabs__container {
  background: none;
  border: none;
  margin: 1em 0;
  padding: 0;
}
.upcoming-events, .past-events {
  justify-content: space-between;
  display: flex;
  flex-wrap: wrap;
}
.upcoming-event {
  margin: 0;
  width: 100%;
  @media (min-width: 48em) {
    width: calc(50% - 2.4rem); // Account for the margins and the border
  }
}
.news-list-item {
  border-bottom: 2px solid #d8d8d8;
  padding: 1.5em 0;
  &:first-child {
    padding-top: 0;
  }
}
.newsletter-wrap {
  font-size: 1.125rem;
  line-height: 1.5rem;
  margin-bottom: 2rem;
  @media (min-width: 48em) {
    margin-bottom: 0;
  }
  p {
    color: $darkBlue
  }
}
.twitter-wrap {
  @media (min-width: 48em) {
    border-left: 2px solid #d8d8d8;
  }
}

.btn-load-more {
  background: none;
  border: none;
  color: $purple;
  cursor: pointer;
  display: block;
  font-size: 1rem;
  font-weight: 500;
  padding: 0;
  text-decoration: underline;
}

.newsletter-archive {
  & > a {
    display: inline-block;
  }
}
::v-deep .el-button {
  a {
    text-decoration: none !important;
  }
}

.get-involved-buttons-container {
  display: flex;
  flex-direction: column;
  width: fit-content;
}

.get-involved-button {
  width: 100%;
  margin-left: 0 !important;
}

::v-deep .tabs {
  padding: 0;
}
</style>
