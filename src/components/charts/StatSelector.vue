<script setup lang="ts">
import { ref } from "vue";
import DayAccumulator, { Option } from "../../data/stat/DayAccumulator";

import DayChart from "./DayChart.vue";
import Header from "../Header.vue";
import EXTENSIONS from "../../data/stat/extra";

const props = defineProps<{ data: DayAccumulator }>();

const options = EXTENSIONS.filter((extension) => !!extension.getOption).map(
  (extension) => extension.getOption!(props.data.getExtraStat(extension.key))
);

const selectedOption = ref<Option>(options[0]);

function select(option: Option) {
  selectedOption.value = option;
}
</script>

<template>
  <div class="stats">
    <div class="buttons">
      <button
        v-for="option in options"
        :class="{
          active: option.title === selectedOption.title,
        }"
        @click="select(option)"
      >
        {{ option.title }}
      </button>
    </div>
    <div class="detail">
      <Header :title="selectedOption.title">
        {{ selectedOption.description }}
      </Header>
      <DayChart
        :day="(selectedOption as Option).day!"
        :title="selectedOption.title"
        :description="selectedOption.description"
        :focus="selectedOption.focus"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats {
  display: flex;
  position: relative;

  .buttons {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    width: 200px;
    align-self: end;
    padding: 0 12px;
    position: absolute;
    top: 0;
    bottom: 0;

    button {
      border: 3px solid #37176a;
      border-radius: 5px;
      background: #f9f6ff;
      box-shadow: 2px 2px 2px #37176a;
      padding: 8px;
      margin: 4px 0;
      cursor: pointer;

      &:first-child {
        margin-top: 0;
      }

      &.active {
        background: #c0b0d9;
        box-shadow: none;
      }

      &:hover {
        background: #c0b0d9;
      }
    }
  }

  .detail {
    margin-left: 236px;
  }
}
</style>
