<script setup lang="ts">
import { useSlots } from "vue";

const { title } = defineProps<{
  title: string;
}>();

const slots = useSlots();
const showDescription = !!slots.default;
</script>

<template>
  <div class="header">
    <h2>{{ title }}</h2>
    <p v-if="showDescription"><slot></slot></p>
  </div>
</template>

<style lang="scss" scoped>
.header {
  margin-bottom: 12px;

  h2 {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
