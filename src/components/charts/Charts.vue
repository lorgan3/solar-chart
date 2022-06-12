<script setup lang="ts">
import DayAccumulator from "../../data/stat/DayAccumulator";
import { deserializeDayAccumulator } from "../../data/VueSerializer";
import SelfSufficiencyChart from "./SelfSufficiencyChart.vue";
import UsageChart from "./UsageChart.vue";
import StatSelector from "./StatSelector.vue";
import { format } from "../../util/Date";
import MonthlyUsageChart from "./MonthlyUsageChart.vue";
import EXTENSIONS from "../../data/stat/extra";
import Header from "../Header.vue";

const dayAccumulator = new DayAccumulator(EXTENSIONS);
await deserializeDayAccumulator(dayAccumulator);

const length = 300;
</script>

<template>
  <div class="wrapper">
    <h1 class="title">
      Energy stats {{ format(dayAccumulator.getStartDate()) }} -
      {{ format(dayAccumulator.getEndDate()) }}
    </h1>
    <div class="charts">
      <Header title="Self sufficiency">
        A day is considered self sufficient if more power was exported than
        imported. If a big enough battery is installed this should be fairly
        accurate.
      </Header>
      <SelfSufficiencyChart :data="dayAccumulator" />
      <div class="total-usage">
        <Header title="Total usage">
          Total usage and daily average per month.
        </Header>
        <div class="total-usage-charts">
          <UsageChart :data="dayAccumulator" :width="length" :height="length" />
          <MonthlyUsageChart :data="dayAccumulator" :height="length" />
        </div>
      </div>
      <StatSelector :data="dayAccumulator" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  max-width: 960px;
  margin: 0 auto;

  .title {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 20px;
    padding-bottom: 15px;

    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><text dy='14'>⚡️</text></svg>");
    background-repeat: repeat-x;
    background-position: bottom;
  }
}

.charts {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
}

.total-usage {
  &-charts {
    display: flex;
    flex-direction: row;
  }
}
</style>
