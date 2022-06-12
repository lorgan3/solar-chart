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
import { formatMonthYear } from "../../util/Date";
import { formatPower } from "../../util/Formatter";
import { getYScale } from "../../util/Chart";

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
  width?: number;
  height?: number;
}>();

const statsByMonth = props.data.getStats().byMonth;

const labels: string[] = [];
const panels: number[] = [];
const battery: number[] = [];
const grid: number[] = [];
Object.entries(statsByMonth).forEach(([entry, stat]) => {
  const [year, month] = entry.split("/");
  const date = new Date();
  date.setFullYear(Number(year), Number(month) - 1, 1);
  labels.push(formatMonthYear(date));
  panels.push(stat.totalSelfUsed.average);
  battery.push(stat.totalDischarged.average);
  grid.push(stat.gridPower.average);
});

const data: ChartData<"bar", number[], unknown> = {
  labels,
  datasets: [
    {
      label: "Panels",
      backgroundColor: COLORS[7],
      data: panels,
    },
    {
      label: "Battery",
      backgroundColor: COLORS[2],
      data: battery,
    },
    {
      label: "Grid",
      backgroundColor: COLORS[0],
      data: grid,
    },
  ],
};

const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "x",
      boxPadding: 8,
      filter: (item) => (item.raw as number) > Number.EPSILON,
      callbacks: {
        label: (item) => item.dataset.label + ": " + formatPower(item.parsed.y),
      },
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    ...getYScale(),
  },
};
</script>

<template>
  <Bar
    :chart-options="options"
    :chart-data="data"
    chart-id="monthly-usage-chart"
    :width="props.width"
    :height="props.height"
    style="width: 100%"
  />
</template>

<style lang="scss" scoped></style>
