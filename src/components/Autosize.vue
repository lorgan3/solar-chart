<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";

const { ratio } = defineProps<{ ratio: number }>();

const div = ref<HTMLDivElement | null>(null);

const onResize = () => {
  const width = div.value!.clientWidth;
  div.value!.style.height = `${width * ratio}px`;
};

onMounted(() => {
  onResize();

  window.addEventListener("resize", onResize);
});
onUnmounted(() => window.removeEventListener("resize", onResize));
</script>

<template>
  <div class="autosize" ref="div">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.autosize {
  display: flex;
  position: relative;
  overflow: hidden;
}
</style>
