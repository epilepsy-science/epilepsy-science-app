<template>
  <ul class="tag-list unstyled">
    <li v-for="tag in tags" :key="tag">
      <NuxtLink
        class="tag-list-tag"
        :to="{
          name: 'index',
          query: {
            tag: tag
          }
        }"
      >
        {{ tag }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TagList',

  props: {
    tags: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss">
.tag-list {
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: left;
  li {
    display: inline-block;
    margin: 0 6px 6px 0;
  }
}
.tag-list-tag {
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #d6dde6;
  color: #3E7877;
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 16px;
  padding: 4px 9px;
  text-align: left;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  &:hover,
  &:focus {
    background-color: #3E7877;
    border-color: #3E7877;
    color: #fff;
    text-decoration: none;
  }
}
</style>
