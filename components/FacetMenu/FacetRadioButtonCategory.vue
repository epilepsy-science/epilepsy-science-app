<template>
  <facet-label 
    :label="label" 
    :show-collapsible-arrow="false" 
    :collapse-by-default="false"
  >
    <el-radio-group
      v-model="selectedOption"
      class="fill-width white-background negate-label-padding"
      @input="selectionChanged"
    >
      <el-radio
        v-for="option in options"
        :key="option.id"
        class="radio"
        :label="option.label"
      />
    </el-radio-group>
  </facet-label>
</template>

<script>
import FacetLabel from './FacetLabel.vue'

export default {
  name: 'FacetRadioButtonCategory',

  components: { FacetLabel },

  props: {
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    defaultSelectedOption: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      selectedOption: this.defaultSelectedOption
    }
  },

  computed: {},
  watch: {
    defaultSelectedOption: function() {
      this.selectedOption = this.defaultSelectedOption
    }
  },

  mounted() {},

  methods: {
    selectionChanged: function(newValue) {
      const newValueId = this.options.find(option => option.label == newValue).id
      this.$emit('selection-changed', newValueId)
    }
  }
}
</script>

<style>
.el-radio__input.is-checked + .el-radio__label {
  color: #e76f51;
}
.el-radio__input.is-checked .el-radio__inner {
  border-color: #e76f51;
  background: #e76f51;
}
</style>

<style lang="scss" scoped>
@import '../../assets/_variables.scss';
.radio {
  display: block;
  text-transform: capitalize;
  margin: 1rem 2rem;
}

.fill-width {
  width: 100%;
}

.white-background {
  background-color: white;
}

.negate-label-padding {
  margin-top: -0.5rem;
}
</style>
