<script setup lang="ts">
import { Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartOptions,
  ChartData,
  ArcElement,
} from "chart.js";
import { COLORS } from "../../util/Color";
import DayAccumulator from "../../data/stat/DayAccumulator";
import { formatPercentage, formatPower } from "../../util/Formatter";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps<{
  data: DayAccumulator;
  width?: number;
  height?: number;
}>();
const stats = props.data.getStats();

const dataset = [
  [stats.solarPercentage, stats.totalSelfUsed],
  [stats.batteryPercentage, stats.totalDischarged],
  [stats.gridPercentage, stats.gridPower],
];
const data: ChartData<"pie", number[], unknown> = {
  labels: ["Solar panels", "Battery", "Grid"],
  datasets: [
    {
      label: "Usage",
      backgroundColor: [COLORS[7], COLORS[2], COLORS[0]],
      data: dataset.map((acc) => acc[0].average),
    },
  ],
};

const options: ChartOptions<"pie"> = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      boxPadding: 8,
      callbacks: {
        title: (item) => item[0].label,
        label: (item) => {
          const data = dataset[item.dataIndex];
          return `${formatPercentage(data[0].average)} - ${formatPower(
            data[1].sum
          )}`;
        },
      },
    },
  },
};
</script>

<template>
  <Pie
    :chart-options="options"
    :chart-data="data"
    chart-id="self-sufficiency-chart"
    :width="props.width"
    :height="props.height"
  />
</template>

<style lang="scss" scoped></style>
