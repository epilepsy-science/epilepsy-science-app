export default {
  /**
   * Outside of localhost visibility
   */
  // server: {
  //   host: '0.0.0.0'
  // },
  /*
   ** Headers of the page
   */
  head: {
    title: 'Epilepsy.Science - Advancing Epilepsy Research Worldwide',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Progressing Epilepsy research around the globe',
      },
      {
        hid: 'keywords',
        name: 'keywords',
        content: 'Epilepsy, University of Pennsylvania, Harvard University, University of Pennsylvania Hospital, Massachusetts General Hospital'
      },
      // default social cards information for site sharing url's
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:title', property: 'og:title', content: 'Epilepsy.Science' },
      { hid: 'og:description', property: 'og:description', content: 'Progressing Epilepsy research around the globe' },
      { hid: 'og:image', property: 'og:image',
        content: 'http://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png'
      },
      { hid: 'og:image:secure_url', property: 'og:image:secure_url',
        content: 'http://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png'
      },
      { hid: 'og:url', property: 'og:url', content: process.env.ROOT_URL || 'sparc.science' },
      { hid: 't-type', name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@sparc_science' },
      { name: 'twitter:title', content: 'SPARC Portal' },
      { name: 'twitter:image', content: 'http://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png' },
      { name: 'twitter:description', content: 'Stimulating Peripheral Activity to Relieve Conditions (SPARC)' }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon/favicon.ico'
      },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap'
      }
    ]
  },
  env: {
    portal_api: process.env.PORTAL_API_HOST || 'https://sparc-api.herokuapp.com',
    flatmap_api:
      process.env.FLATMAP_API_HOST || 'https://mapcore-demo.org/current/flatmap/v3/',
    crosscite_api_host:
      process.env.CROSSCITE_API_HOST || 'https://citation.crosscite.org',
    discover_api_host:
      process.env.PENNSIEVE_DISCOVER_API_HOST || 'https://api.pennsieve.io/discover',
    zipit_api_host:
      process.env.ZIPIT_API_HOST || 'https://api.pennsieve.io/zipit/discover',
    osparc_host: process.env.OSPARC_HOST || 'https://osparc.io',
    bitly_expand_endpoint: 'https://api-ssl.bitly.com/v4/expand',
    ctf_event_id: 'event',
    ctf_news_id: 'news',
    ctf_community_spotlight_item_id: 'communitySpotlight',
    ctf_news_and_events_id: 'newsAndEvents',
    ctf_resource_id: 'sparcPartners',
    ctf_help_id: 'helpDocument',
    ctf_learn_more_item_id: 'learnMoreItem',
    ctf_sparc_policies_id: 'sparcPolicies',
    ctf_project_id: 'sparcAward',
    ctf_organ_id: 'organ',
    ctf_success_story_id: 'successStory',
    ctf_about_details_content_type_id: 'aboutPageSecondLevel',

    // Updated epilepsy.science ids
    ctf_portal_notification_entry_id: '1kGepfPts4FM3tDfOGVPnQ',
    ctf_footer_copy_id: '3dY5OIZZcCCHmcFEIAgsVl',
    ctf_resource_hero_id: 'v1RaymYIp0g20jBjj38G0',
    ctf_tools_and_resources_page_id: '5gOQBmYpDBRPtJh7Yzj8SP',
    ctf_about_page_id: 'eGyEJR9pBdNT4zI71Y6sD',
    ctf_about_portal_page_id: '3QNKLvQyniXdkmFPVI7skQ',
    ctf_home_page_id: '4KuOw0SnxWqN7SZ6W68oey',

    // Old sparc.science ids
    ctf_help_list_id: 'helpSection',
    ctf_help_aws_id: 'zQfzadwADutviJjT19hA5',
    ctf_what_we_offer_page_id: '4wuZ2gzxota1GLTFUXSLNb',
    ctf_team_and_leadership_page_id: '7EL9Plxo7q2GyCzg1sqIcg',
    ctf_get_involved_page_id: 'jxEBoBw2zUctuDaX2eeX1',
    ctf_about_policies_page_id: '71a9NzpuHvaTpgTf9ir1xg',
    ctf_contact_us_form_type_id: 'contactUsForm',
    ctf_support_page_id: '59F0dM5goobqjw3TsqINRw',
    ctf_news_and_events_page_id: '4IoMamTLRlN3OpxT1zgnU',
    ctf_dataset_navigation_info_page_id: 'qvEcnv56c76V0JC0KvtSd',
    ctf_dataset_format_info_page_id: '3FXikFXC8shPRd8xZqhjVT',
    ctf_filter_id: '6bya4tyw8399',
    ctf_filters_dataset_id: '7fL88ABgKSB2tPJmysn2V',
    ctf_filters_project_id: 'YVan5NSd4bgj2Q5WZdOVw',
    ctf_filters_organ_id: '5Hhlb7Lf4yijMQUSBai1fh',
    ctf_filters_image_id: '4R4zfdND13xLLGU9nPpNCD',
    ctf_filters_simulation_id: '6qMQRugMyzeaUrTIPQDdF1',
    ctf_terms_id: '6XCER8v1TVVCoZdaBWg66t',
    ctf_privacy_policy_id: '2p44GCn1rrWUETwTRF2ElS',
    ctf_documentation_hub_redirects_id: 'yhBSKvDSpBQbeHQWHgj9j',
    ctf_contact_us_form_options_id: '79rwRA0rUqUj6rc913BFsz',
    ctf_sparc_login_modal_id: '4FSEoB6SW8xrEAsh4t0vGt',
    
    CTF_SPACE_ID: process.env.CTF_SPACE_ID,
    CTF_CDA_ACCESS_TOKEN: process.env.CTF_CDA_ACCESS_TOKEN,
    CTF_API_HOST: process.env.CTF_API_HOST || 'preview.contentful.com',
    DEPLOY_ENV: process.env.DEPLOY_ENV || 'development',
    ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_INDEX: process.env.ALGOLIA_INDEX || 'k-core_dev',
    ALGOLIA_INDEX_PUBLISHED_TIME_DESC: process.env.ALGOLIA_INDEX_PUBLISHED_TIME_DESC || 'k-core_dev_published_time_desc',
    ALGOLIA_INDEX_PUBLISHED_TIME_ASC: process.env.ALGOLIA_INDEX_PUBLISHED_TIME_ASC || 'k-core_dev_published_time_asc',
    ALGOLIA_INDEX_ALPHABETICAL_A_Z: process.env.ALGOLIA_INDEX_ALPHABETICAL_A_Z || 'k-core_dev_alphabetical_a_z',
    ALGOLIA_INDEX_ALPHABETICAL_Z_A: process.env.ALGOLIA_INDEX_ALPHABETICAL_Z_A || 'k-core_dev_alphabetical_z_a',
    BITLY_ACCESS_TOKEN: process.env.BITLY_ACCESS_TOKEN,
    BL_API_URL: 'https://sparc.biolucida.net/api/v1/',
    BL_SERVER_URL: 'https://sparc.biolucida.net',
    BL_SHARE_LINK_PREFIX: 'https://sparc.biolucida.net/image?c=',
    MBF_SPARC_API: process.env.MBF_SPARC_API || 'https://mbfsparcapi.com',
    NL_LINK_PREFIX: 'https://sparc.biolucida.net:8081',
    ROOT_URL: process.env.ROOT_URL || 'http://localhost:3000',
    max_download_size: parseInt(process.env.MAX_DOWNLOAD_SIZE || '5000000000'),
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_USER_POOL_ID: process.env.AWS_USER_POOL_ID || 'us-east-1_FVLhJ7CQA',
    AWS_USER_POOL_WEB_CLIENT_ID: process.env.AWS_USER_POOL_WEB_CLIENT_ID || '',
    AWS_USER_AUTHENTICATION_FLOW_TYPE: process.env.AWS_USER_AUTHENTICATION_FLOW_TYPE || 'USER_PASSWORD_AUTH',
    AWS_OAUTH_DOMAIN: process.env.AWS_OAUTH_DOMAIN || 'pennsieve-dev-users2.auth.us-east-1.amazoncognito.com',
    AWS_OAUTH_SCOPE: process.env.AWS_OAUTH_SCOPE || ["openid"],
    AWS_OAUTH_REDIRECT_SIGN_IN_URL: process.env.AWS_OAUTH_REDIRECT_SIGN_IN_URL || 'http://localhost:3000',
    AWS_OAUTH_REDIRECT_SIGN_OUT_URL: process.env.AWS_OAUTH_REDIRECT_SIGN_OUT_URL || 'http://localhost:3000',
    AWS_OAUTH_RESPONSE_TYPE: process.env.AWS_OAUTH_RESPONSE_TYPE || "token",
    SHOW_LOGIN_FEATURE: process.env.SHOW_LOGIN_FEATURE || 'false',
    LOGIN_API_URL: process.env.LOGIN_API_URL || 'https://api.pennsieve.net',
    ORCID_API_URL: process.env.ORCID_API_URL || 'https://pub.orcid.org/v2.1',
    GOOGLE_ANALYTICS_GA4: process.env.GOOGLE_ANALYTICS_GA4,
    GOOGLE_ANALYTICS_UA: process.env.GOOGLE_ANALYTICS_UA,
    SHOW_TIMESERIES_VIEWER: process.env.SHOW_TIMESERIES_VIEWER || false,
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    SHOW_METRICS: process.env.SHOW_METRICS || 'false',
    SHOW_FUNDING_FACET: process.env.SHOW_FUNDING_FACET || 'false',
    SHOW_OSPARC_TAB: process.env.SHOW_OSPARC_TAB || 'false',
    METRICS_URL: process.env.METRICS_URL || 'https://metrics.sparc.science'
  },

  serverMiddleware: [
    // Will register redirect-ssl npm package
    'redirect-ssl'
  ],

  /*
   ** Customize the loading component
   */
  loading: '@/components/Loading/Loading.vue',

  /*
   ** Customize router classes globally
   */
  router: {
    linkActiveClass: 'active-link',
    extendRoutes(routes) {
      // Redirects
      routes.push({
        path: '/submit_data.html',
        redirect: '/help/7k8nEPuw3FjOq2HuS8OVsd'
      })
      routes.push({
        name: 'version',
        path: '/datasets/:datasetId/version/:version',
        component: '@/pages/datasets/_datasetId.vue'
      })
    },
    middleware: ['verifyUserProfileComplete', 'documentationHubRedirects', 'signOutRedirect']
  },
  /*
   ** Global CSS
   */
  css: ['element-ui/lib/theme-chalk/index.css', '@nih-sparc/sparc-design-system-components/src/assets/styles.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/bootstrap',
    '@/plugins/contentful',
    '@/plugins/amplify',
    '@/plugins/documentation-hub-redirects',
    "@/plugins/vue-gtag.client.js",
    { src: '@/plugins/postscribe', mode: 'client' },
    { src: '@/plugins/system-design-components', mode: 'client' },
    { src: '@/plugins/tsviewer', mode: 'client' }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxt/typescript-build',
    [
      '@nuxtjs/google-analytics',
      {
        id: process.env.GOOGLE_ANALYTICS_UA
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/robots',
    'cookie-universal-nuxt',
    '@miyaoka/nuxt-twitter-widgets-module',
    'vue-social-sharing/nuxt',
    '@nuxtjs/proxy',
    ['@nuxtjs/recaptcha', {
      siteKey: process.env.RECAPTCHA_SITE_KEY,
      version: "2"
    }]
  ],
  axios: {
    proxy: true
  },
  proxy: {
    "/captcha-api/": {
      target: "https://www.google.com/recaptcha/api",
      pathRewrite: {
        "^/captcha-api": ""
      }
    }
  },
  /*
   ** robots.txt
   */
  robots: [
    {
      // all environment
      UserAgent: '*',

      // disallow all in all environments except production
      Disallow: () => (process.env.DEPLOY_ENV !== 'production' ? '/' : [])
    }
  ],
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/, 'system-design-components'],
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    },
    html: {
      minify: {
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyElements: true
      }
    }
  }
}
