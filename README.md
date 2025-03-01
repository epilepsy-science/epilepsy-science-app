# EPILEPSY.SCIENCE WEB APPLICATION
This is the repository for the Epilepsy.Science Web Application. The application is build using [Nuxt.js](https://nuxtjs.org) and [Vue.js](https://vuejs.org/).

## Build Setup

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

## Important Note on Running Locally

Ensure that the following configuration variables are set in your environment prior to running (values can be obtained once you are given access to epilepsy.science developer apps on Heroku):
* ALGOLIA_API_KEY
* ALGOLIA_APP_ID
* ALGOLIA_INDEX
* CTF_SPACE_ID
* CTF_CDA_ACCESS_TOKEN
* CTF_API_HOST
* DEPLOY_ENV
* PORTAL_API_HOST
* AWS_USER_POOL_WEB_CLIENT_ID
* RECAPTCHA_SECRET_KEY
* RECAPTCHA_SITE_KEY

Add your env vars to `env_var_set.sh` and then run `source env_var_set.sh`


For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
