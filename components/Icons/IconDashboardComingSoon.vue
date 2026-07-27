<template>
  <svg
    v-show="isVisible"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M3 21h18" />
    <rect x="5" y="14" width="3" height="7" />
    <rect x="10.5" y="10" width="3" height="11" />
    <circle cx="17.5" cy="9.5" r="4" />
    <path d="M17.5 7.5v2l1.5 1" />
  </svg>
</template>

<script>
export default {
  name: "IconDashboardComingSoon",
  props: {
    width: {
      type: Number,
      default: 72,
    },
    height: {
      type: Number,
      default: 72,
    },
    color: {
      type: String,
      default: "currentColor",
    },
    isVisible: {
      type: Boolean,
      default: true,
    }
  },
};
</script>
