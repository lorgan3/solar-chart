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
import {
  deserializeDay,
  deserializeDayAccumulator,
} from "../../data/VueSerializer";
import { format, formatWithHour } from "../../util/Date";
import DayStats from "../DayStats.vue";
import { formatPower } from "../../util/Formatter";
import { getYScale } from "../../util/Chart";
import DayAccumulator from "../../data/stat/DayAccumulator";
import { yearSelfSufficiency } from "../../data/stat/extra/YearSelfSufficiency";
import { darkestPeriod } from "../../data/stat/extra/DarkestPeriod";
import SelfSufficiencyChart from "../SelfSufficiencyChart.vue";
import UsageChart from "../UsageChart.vue";
import StatSelector from "../StatSelector.vue";
import { sunniestDay } from "../../data/stat/extra/SunniestDay";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps<{
  date: Date;
}>();

const day = await deserializeDay(props.date);

const dayAccumulator = new DayAccumulator([
  yearSelfSufficiency,
  darkestPeriod,
  sunniestDay,
]);
await deserializeDayAccumulator(dayAccumulator);

const hourData: ChartData<"bar", number[], unknown> = {
  labels: day.data.map((_, index) => index),
  datasets: [
    {
      label: "Panels",
      backgroundColor: COLORS[7],
      data: day.data.map((data) => data.selfUsePower.average),
    },
    {
      label: "Battery",
      backgroundColor: COLORS[2],
      data: day.data.map((data) => data.dischargePower.average),
    },
    {
      label: "Grid",
      backgroundColor: COLORS[0],
      data: day.data.map(
        (data) =>
          data.usePower.average -
          data.dischargePower.average -
          data.selfUsePower.average
        // + data.chargePower.average
      ),
    },
  ],
};

const hourChartOptions: ChartOptions<"bar"> = {
  responsive: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "x",
      boxPadding: 8,
      filter: (item) => (item.raw as number) > Number.EPSILON,
      callbacks: {
        title: (items) =>
          formatWithHour(
            new Date(
              props.date.getFullYear(),
              props.date.getMonth(),
              props.date.getDate(),
              items[0].dataIndex
            )
          ),
        label: (item) => item.dataset.label + ": " + formatPower(item.parsed.y),
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      type: "linear",
      min: 0,
      max: 23,
      grace: 0,
      ticks: {
        stepSize: 6,
        callback: (value) => String(value).padStart(2, "0") + ":00",
      },
    },
    ...getYScale(),
  },
};

const dayData: ChartData<"bar", number[], unknown> = {
  labels: ["Total"],
  datasets: [
    {
      label: "Panels",
      backgroundColor: COLORS[7],
      data: [
        day.data.reduce((sum, data) => sum + data.selfUsePower.average, 0),
      ],
    },
    {
      label: "Battery",
      backgroundColor: COLORS[2],
      data: [
        day.data.reduce((sum, data) => sum + data.dischargePower.average, 0),
      ],
    },
    {
      label: "Grid",
      backgroundColor: COLORS[0],
      data: [
        day.data.reduce(
          (sum, data) =>
            sum +
            data.usePower.average -
            data.dischargePower.average -
            data.selfUsePower.average,
          // + data.chargePower.average,
          0
        ),
      ],
    },
  ],
};

const dayChartOptions: ChartOptions<"bar"> = {
  responsive: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "x",
      boxPadding: 8,
      filter: (item) => (item.raw as number) > Number.EPSILON,
      callbacks: {
        title: () => format(props.date),
        label: (item) => item.dataset.label + ": " + formatPower(item.parsed.y),
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grace: 0,
    },
    ...getYScale({ position: "right" }),
  },
};
</script>

<template>
  <div class="wrapper">
    <Bar
      :chart-options="hourChartOptions"
      :chart-data="hourData"
      chart-id="hour-chart"
      :width="600"
      :height="300"
    />
    <Bar
      :chart-options="dayChartOptions"
      :chart-data="dayData"
      chart-id="day-chart"
      :width="130"
      :height="300"
    />
    <DayStats :day="day" />
  </div>
  <SelfSufficiencyChart :data="dayAccumulator" />
  <UsageChart :data="dayAccumulator" />
  <StatSelector :data="dayAccumulator" />
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  width: 750px;
  justify-content: space-between;
}
</style>
