<template>
  <img class="logo" alt="SPARC logo" :src="logo" />
</template>

<script>
import logo from '@/static/images/epilepsy.science.png'

export default {
  name: 'SparcLogo',
  data: () => ({
    logo
  })
}
</script>

<style scoped lang="scss">
.logo {
  height: 100%;
}
</style>
