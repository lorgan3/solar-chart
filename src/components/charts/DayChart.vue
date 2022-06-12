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
  ChartDataset,
} from "chart.js";
import { COLORS } from "../../util/Color";
import { format, formatWithHour } from "../../util/Date";
import { formatPower } from "../../util/Formatter";
import { getYScale } from "../../util/Chart";
import Day from "../../data/Day";
import { computed, ref, watch } from "vue";
import DayStats from "./DayStats.vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = withDefaults(
  defineProps<{
    day: Day;
    focus?: "input" | "output";
    max?: number;
  }>(),
  { focus: "output" }
);

const hourData = ref<ChartData<"bar", number[], unknown>>({ datasets: [] });
const dayData = ref<ChartData<"bar", number[], unknown>>({ datasets: [] });
const showIO = ref(false);

watch(
  [() => props.day, () => props.focus, showIO],
  ([newDay, newFocus]) => {
    const hourDataset: ChartDataset<"bar">[] = [];
    if (newFocus === "input" || showIO.value) {
      hourDataset.push({
        label: "Panels",
        backgroundColor: COLORS[4],
        data: newDay.data.map((data) => data.productPower.average),
        stack: "input",
      });
    }

    if (newFocus === "output" || showIO.value) {
      hourDataset.push(
        {
          label: "Panels",
          backgroundColor: COLORS[7],
          data: newDay.data.map(
            (data) => data.selfUsePower.average - data.chargePower.average
          ),
          stack: "output",
        },
        {
          label: "Battery",
          backgroundColor: COLORS[2],
          data: newDay.data.map((data) => data.dischargePower.average),
          stack: "output",
        },
        {
          label: "Grid",
          backgroundColor: COLORS[0],
          data: newDay.data.map(
            (data) =>
              data.usePower.average -
              data.dischargePower.average -
              data.selfUsePower.average +
              data.chargePower.average
          ),
          stack: "output",
        }
      );
    }

    hourData.value = {
      labels: newDay.data.map((_, index) => index),
      datasets: hourDataset,
    };

    const dayDataset: ChartDataset<"bar">[] = [];
    if (newFocus === "input" || showIO.value) {
      dayDataset.push({
        label: "Panels",
        backgroundColor: COLORS[4],
        data: [
          newDay.data.reduce((sum, data) => sum + data.productPower.average, 0),
        ],
        stack: "input",
      });
    }

    if (newFocus === "output" || showIO.value) {
      dayDataset.push(
        {
          label: "Panels",
          backgroundColor: COLORS[7],
          data: [
            newDay.data.reduce(
              (sum, data) =>
                sum + data.selfUsePower.average - data.chargePower.average,
              0
            ),
          ],
          stack: "output",
        },
        {
          label: "Battery",
          backgroundColor: COLORS[2],
          data: [
            newDay.data.reduce(
              (sum, data) => sum + data.dischargePower.average,
              0
            ),
          ],
          stack: "output",
        },
        {
          label: "Grid",
          backgroundColor: COLORS[0],
          data: [
            newDay.data.reduce(
              (sum, data) =>
                sum +
                data.usePower.average -
                data.dischargePower.average -
                data.selfUsePower.average +
                data.chargePower.average,
              0
            ),
          ],
          stack: "output",
        }
      );
    }

    dayData.value = {
      labels: ["Total"],
      datasets: dayDataset,
    };
  },
  { immediate: true }
);

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
              props.day.date.getFullYear(),
              props.day.date.getMonth(),
              props.day.date.getDate(),
              items[0].dataIndex
            )
          ),
        beforeBody: (item) =>
          showIO.value
            ? item[0].dataset.stack === "input"
              ? "Production"
              : "Consumption"
            : "",
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
    ...getYScale({ max: props.max }),
  },
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
        title: () => format(props.day.date),
        beforeBody: (item) =>
          showIO.value
            ? item[0].dataset.stack === "input"
              ? "Production"
              : "Consumption"
            : "",
        label: (item) => item.dataset.label + ": " + formatPower(item.parsed.y),
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grace: 0,
    },
    ...getYScale({ position: "right", max: props.max }),
  },
};

const toggleFocus = () => (showIO.value = !showIO.value);
const mode = computed(() => (showIO.value ? "in / out" : props.focus));
</script>

<template>
  <div class="wrapper">
    <div class="charts">
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
        :width="150"
        :height="300"
      />
    </div>
    <DayStats :day="props.day" />
    <button class="toggle" @click="toggleFocus">Showing {{ mode }}</button>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;

  .toggle {
    border: none;
    background: no-repeat;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }

  .charts {
    display: flex;
    width: 770px;
    justify-content: space-between;
  }
}
</style>
