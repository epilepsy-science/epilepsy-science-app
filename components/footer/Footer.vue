<template>
  <div class="footer">
    <div class="container">
      <el-row :gutter="32">
        <el-col :sm="{ span: 22, offset: 1 }" :md="{ span: 12, offset: 0 }">
          <div class="footer__info">
            <div class="footer__info--logo">
              <nuxt-link :to="{ name: 'index' }">
                <sparc-logo />
              </nuxt-link>
            </div>
            <div class="footer__info--blurb">
              <p>
                {{ footerData.copy }}
              </p>
            </div>
            <!-- <div class="footer__info--social">
              <a href="https://twitter.com/sparc_science" target="_blank">
                <svg-icon
                  icon="icon-twitter"
                  color="#606266"
                  height="32px"
                  width="32px"
                />
              </a>
              <a
                href="https://www.linkedin.com/groups/12694019"
                target="_blank"
              >
                <svg-icon
                  icon="icon-linkedin"
                  color="#606266"
                  height="32px"
                  width="32px"
                />
              </a>
              <a
                href="https://www.youtube.com/channel/UCCmUx4tOSlTAwlUrjSGz2mw"
                target="_blank"
              >
                <svg-icon
                  icon="icon-youtube"
                  color="#606266"
                  height="32px"
                  width="32px"
                />
              </a>
            </div> -->
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import FooterLink from './FooterLink.vue'
import SparcLogo from '@/components/logo/SparcLogo.vue'

export default {
  name: 'SparcFooter',
  components: {
    FooterLink,
    SparcLogo
  },

  computed: {
    ...mapState('layouts/default', {
      footerData: state => state.footerData
    })
  }
}
</script>

<style scoped lang="scss">
@import '@nih-sparc/sparc-design-system-components/src/assets/_variables.scss';

.footer {
  display: flex;
  flex-direction: row;
  padding: 3rem 1rem;
  background-color: #F8FAFF;

  &__info {
    &--logo {
      height: 4rem;
      margin-bottom: 1.5rem;
    }

    &--blurb {
      margin-bottom: 3rem;
      p {
        font-size: 1rem;
        font-weight: normal;
        line-height: 2rem;
        color: $mediumGrey;
      }
    }

    &--social {
      margin-bottom: 3rem;
      .svg-icon {
        width: 2.2rem;
        margin-right: 1rem;
      }
    }
  }

  &__links {
    h3 {
      font-size: 1rem;
      font-weight: bold;
      line-height: 2rem;
      color: $mediumGrey;
    }
    ul {
      list-style: none;
      padding-left: 0;

      li {
        padding-bottom: 1rem;
      }

      a {
        color: $mediumGrey;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

@media screen and (max-width: 1023px) {
  .footer {
    &__info {
      &--logo {
        height: 2rem;
      }

      &--blurb {
        font-size: 0.75rem;
        font-weight: normal;
        line-height: 1.25rem;

        p {
          margin-bottom: 1rem;
        }
      }

      &--re3data {
        margin-bottom: 1.5rem;
      }
    }
  }
}
</style>
