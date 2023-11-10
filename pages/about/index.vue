<template>
  <div class="about-page pb-16">
    <breadcrumb :breadcrumb="breadcrumb" title="About Epilepsy.Science" />
    <page-hero v-if="heroCopy">
      <h1>{{ pageTitle }}</h1>
      <!-- eslint-disable vue/no-v-html -->
      <!-- marked will sanitize the HTML injected -->
      <div v-html="parseMarkdown(heroCopy)" />
    </page-hero>
    <div class="page-wrap container">
      <h3>What are we doing here at Epilepsy.Science?</h3>

      <p>
        Epilepsy.Science is a new cloud-based platform for managing, analyzing,
        publishing, and sharing scientific datasets to accelerate epilepsy
        research. This collaboration unites three leading organizations -
        Pennsieve, the Brain Data Science Platform (BDSP), and the AWS Open Data
        Sponsorship Program - to create an unparalleled open data resource for
        the epilepsy community.
      </p>

      <p>
        The mission of Epilepsy.Science is to drive progress in understanding,
        treating, and ultimately curing epilepsy through open access to
        multidimensional epilepsy data at scale. The platform provides over
        200,000 EEG recordings from diverse contexts including routine
        outpatient EEGs, critically ill patients, and epilepsy monitoring unit
        evaluations. As it grows, it will also include extensive accompanying
        clinical data like medications, imaging, genetics, and more from
        institutions worldwide.
      </p>

      <p>
        Researchers can use Epilepsy.Science to easily build customized cohorts
        by connecting data points across datasets. The platform enables
        scientists to publish -- at no cost -- high quality datasets for
        citation, reuse, and reproducible research. By promoting open science,
        Epilepsy.Science aims to accelerate discoveries and improve patient
        outcomes.
      </p>

      <p>This collaboration brings together:</p>

      <ul>
        <li>
          Pennsieve’s scalable data management and sharing capabilities and
          graph-based data integration model.
        </li>

        <li>
          BDSP’s extensive data resources including over 200,000 EEG recordings
          and genetics, imaging, and clinical data. BDSP also contributes a
          library of open-source analytics tools.
        </li>

        <li>
          The AWS Open Data Sponsorship Program provides cloud credits to cover
          storage costs, enabling sustainable public access.
        </li>
      </ul>

      <p>
        By combining the strengths of these leading organizations,
        Epilepsy.Science offers unprecedented opportunities for open,
        collaborative epilepsy research through its powerful data resources,
        analytics tools, and cloud-based platform.
      </p>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'
import PageHero from '@/components/PageHero/PageHero.vue'
import Paper from '@/components/Paper/Paper.vue'
import Gallery from '~/components/Gallery/Gallery.vue'

import createClient from '@/plugins/contentful.js'

import ContentfulErrorHandle from '@/mixins/contentful-error-handle'
import MarkedMixin from '@/mixins/marked'

const client = createClient()

export default {
  name: 'AboutPage',

  components: {
    Breadcrumb,
    PageHero,
    Paper,
    Gallery
  },

  mixins: [ContentfulErrorHandle, MarkedMixin],

  asyncData() {
    return Promise.all([
      // Get page content
      client.getEntry(process.env.ctf_about_page_id)
    ])
      .then(([page]) => {
        return { ...page.fields }
      })
      .catch((e) => {
        console.error(e);
        //The ContentfulErrorHandle mixins will display out an
        //error message
        return { contentfulError: true }
      })
  },

  data: () => {
    return {
      heroCopy: '',
      copy: '',
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        }
      ],
      metricsItems: [],
      highlightsItems: [],
      projectId: process.env.ctf_project_id,
      heroImage: {},
      futurePlans: '',
      aboutPortalPageId: process.env.ctf_about_portal_page_id,
      whatWeOfferPageId: process.env.ctf_what_we_offer_page_id,
      teamAndLeadershipPageId: process.env.ctf_team_and_leadership_page_id,
      getInvolvedPageId: process.env.ctf_get_involved_page_id
    }
  },

  head() {
    return {
      title: this.pageTitle,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.pageTitle,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.heroCopy ? this.heroCopy : 'Stimulating Peripheral Activity to Relieve Conditions (SPARC)'
        },
      ]
    }
  },

  async fetch() {
    const day = new Date().getDay().toString().padStart(2, "0")
    const month = new Date().getMonth().toString().padStart(2, "0")
    const year = new Date().getFullYear()
    let totalDownloads, downloadsLastMonth, totalContributors, newContributors = 0
    await this.$axios
      .$get(`${process.env.METRICS_URL}/pennsieve?year=${year}&month=${month}`)
      .then((response) => {
        const metrics = response[0]
        totalContributors = parseInt(metrics['number_of_sparc_users_overall']['N'])
        newContributors = parseInt(metrics['number_of_new_sparc_users_last_quarter']['N'])
        downloadsLastMonth = parseInt(metrics['number_of_sparc_downloads_last_mo']['N'])
      }).catch((e) => {
        console.log("ERROR RETRIEVING CONTRIBUTORS: ", e)
      })
    await this.$axios
      .$get(`${process.env.discover_api_host}/metrics/dataset/downloads/summary?startDate=2020-01-01&endDate=${year}-${month}-${day}`)
      .then((data) => {
        totalDownloads = 0
        data.forEach(item => {
          if (item['origin'] === "SPARC") {
            totalDownloads += parseInt(item['downloads'])
          }
        })
      })
      .catch((e) => {
        console.log("ERROR RETRIEVING DOWNLOADS: ", e)
      })
    await client.getEntries({
        content_type: process.env.ctf_news_id,
        order: '-fields.publishedDate',
        limit: '999',
        'fields.subject': 'Highlight'
      })
      .then(({ items })=> {
        this.highlightsItems = items
      })
      .catch(() => {
        console.log("ERROR RETRIEVING HIGHLIGHTS")
      })
    this.metricsItems = [
      {
        title: 'Total Downloads',
        data: `${totalDownloads}`,
        subData: `(${downloadsLastMonth} last month)`
      },
      {
        title: 'Dataset Contributors',
        data: `${totalContributors}`,
        subData: `(${newContributors} new in the last month)`
      }
    ]
  },

  methods: {
    /**
     * Compute the link to the help article
     * This will use the slug if available, and fallback
     * to the ID of the entry if not
     * @returns {Object}
     */
    aboutLink(entryId) {
      const route = 'about-aboutDetailsId'
      const aboutDetailsId = entryId
      return { name: route, params: { aboutDetailsId } }
    }
  }
}
</script>

<style scoped lang="scss">
@import '@nih-sparc/sparc-design-system-components/src/assets/_variables.scss';
.about-page {
  background-color: $background;
}

.row-item {
  width: 30%;
  display: flex;
  @media screen and (max-width: 767px) {
    width: 100%;
  }
}

.row {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}

.portal-image {
  height: auto;
  width: 30%;
  min-width: 20rem;

  @media screen and (max-width: 767px) {
    display: none;
  }
}

.margin-top-auto {
  margin-top: auto;
}

.midnightblue-background {
  background-color: $darkBlue;
}

.white-text {
  color: white;
}

.about-page-border {
  border: 1px solid $lineColor2;
}
.gallery-items-container {
  background-color: white;
  border: 1px solid $lineColor1;
}

::v-deep h1 {
  font-size:2rem;
  font-weight:500;
  line-height:2.75rem;
}

::v-deep h2 {
  font-size:1.5rem;
  font-weight:500;
  line-height:2.25rem;
}

::v-deep h3 {
  font-size:1rem;
  font-weight:500;
  line-height:1.875rem;
}

</style>
