<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartOptions,
  ChartData,
} from "chart.js";
import { COLORS } from "../../util/Color";
import DayAccumulator from "../../data/stat/DayAccumulator";
import {
  yearSelfSufficiencyKey,
  YearSelfSufficiencyResult,
} from "../../data/stat/extra/YearSelfSufficiency";
import { formatMonthYear } from "../../util/Date";
import { formatPercentage } from "../../util/Formatter";
import Accumulator from "../../data/Accumulator";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps<{
  data: DayAccumulator;
}>();
const stat = props.data.getExtraStat<YearSelfSufficiencyResult>(
  yearSelfSufficiencyKey
).value;

const selfSufficiency = new Accumulator();
Object.values(stat).forEach((acc) => selfSufficiency.add(acc.average));

const labels: string[] = [];
const dataset: number[] = [];
Object.entries(stat).forEach(([entry, acc]) => {
  const [year, month] = entry.split("/");
  const date = new Date();
  date.setFullYear(Number(year), Number(month) - 1, 1);
  labels.push(formatMonthYear(date));
  dataset.push(acc.average);
});

const data: ChartData<"bar", number[], unknown> = {
  labels,
  datasets: [
    {
      label: "Self suffciency",
      backgroundColor: COLORS[0],
      data: dataset,
    },
  ],
};

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      boxPadding: 8,
      callbacks: {
        label: (item) => {
          const accumulator = Object.values(stat)[item.parsed.x];
          return `Self suffcient on ${accumulator.sum} of ${
            accumulator.getValues().length
          } days`;
        },
      },
    },
  },
  scales: {
    y: {
      max: 1,
      ticks: {
        callback: (value) => formatPercentage(value as number),
        count: 5,
      },
    },
  },
};
</script>

<template>
  <div class="wrapper">
    <div class="widget">
      Self sufficient
      <span class="number">
        {{ formatPercentage(selfSufficiency.average) }}
      </span>
      of the time
    </div>
    <Bar
      :chart-options="options"
      :chart-data="data"
      chart-id="self-suficiency-chart"
      :height="300"
      style="width: 100%"
    />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: row;
  margin: 0 !important;

  .widget {
    width: 300px;
    height: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .number {
      font-size: 48px;
    }
  }
}
</style>
