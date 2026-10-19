<template>
  <div class="white-background">
    <div class="facet-heading px-12 py-4">
      Refine results
    </div>
    <hr />
    <tags-container
      :selected-facets="selectedFacets"
      :visibleFacetCategories="visibleFacetCategories"
      :visibleFacets="visibleFacets"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    />
    <slot />
  </div>
</template>

<script>
import TagsContainer from '@/components/FacetMenu/TagsContainer.vue'
export default {
  name: 'FacetMenu',

  components: { TagsContainer },

  props: {
    selectedFacets: {
      type: Array,
      default: () => []
    },
    visibleFacetCategories: {
      type: Array,
      default: () => []
    },
    visibleFacets: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    deselectAllFacets() {
      this.$emit('deselect-all-facets')
    },
    deselectFacet(id) {
      this.$emit('deselect-facet', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.white-background {
  background-color: white;
  border: 1px solid $es-border;
  border-bottom: none;
  border-radius: $es-radius $es-radius 0 0;
}

.facet-heading {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: $es-teal;
}

hr {
  border: none;
  border-bottom: 1px solid $es-border;
  margin: 0;
}
</style>
