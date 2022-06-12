<script setup lang="ts">
import { ref } from "vue";
import Day from "../../data/Day";
import DayAccumulator from "../../data/stat/DayAccumulator";
import {
  darkestPeriodKey,
  DarkestPeriodResult,
} from "../../data/stat/extra/DarkestPeriod";
import {
  earliestSunshineKey,
  EarliestSunshineResult,
} from "../../data/stat/extra/EarliestSunshine";
import {
  highestGridUsageKey,
  HighestGridUsageResult,
} from "../../data/stat/extra/HighestGridUsage";
import {
  highestUsageKey,
  HighestUsageResult,
} from "../../data/stat/extra/HighestUsage";
import {
  latestSunshineKey,
  LatestSunshineResult,
} from "../../data/stat/extra/LatestSunshine";
import {
  sunniestDayKey,
  SunniestDayResult,
} from "../../data/stat/extra/SunniestDay";
import { format } from "../../util/Date";
import { formatPower } from "../../util/Formatter";
import DayChart from "./DayChart.vue";
import Header from "../Header.vue";

const props = defineProps<{ data: DayAccumulator }>();

interface Option {
  label: string;
  day?: Day;
  title: string;
  description?: string;
  focus?: "input" | "output";
}

const options: Option[] = [
  {
    label: "Average day",
    day: props.data.getAccumulatedDay(),
    title: `Average day from ${format(props.data.getStartDate())} to ${format(
      props.data.getEndDate()
    )}`,
  },
  {
    label: "Sunniest day",
    day: props.data.getExtraStat<SunniestDayResult>(sunniestDayKey).day!,
    title: format(
      props.data.getExtraStat<SunniestDayResult>(sunniestDayKey).day?.date!
    ),
    focus: "input",
  },
  {
    label: "Darkest day",
    day: props.data.getExtraStat<DarkestPeriodResult>(darkestPeriodKey).day!,
    title: format(
      props.data.getExtraStat<DarkestPeriodResult>(darkestPeriodKey).day?.date!
    ),
    focus: "input",
  },
  (() => {
    const data =
      props.data.getExtraStat<EarliestSunshineResult>(earliestSunshineKey);
    const formattedDate = format(data.day?.date!);

    return {
      label: "Earliest sunshine",
      day: data.day!,
      title: "Earliest sunshine",
      description: `${formattedDate} was the day with the earliest sunshine, producing ${formatPower(
        data.amount
      )} at ${data.hour}h.`,
      focus: "input",
    };
  })(),
  (() => {
    const data =
      props.data.getExtraStat<LatestSunshineResult>(latestSunshineKey);
    const formattedDate = format(data.day?.date!);

    return {
      label: "Latest sunshine",
      day: data.day!,
      title: "Latest sunshine",
      description: `${formattedDate} was the day with the latest sunshine, producing ${formatPower(
        data.amount
      )} at ${data.hour}h.`,
      focus: "input",
    };
  })(),
  {
    label: "Highest usage",
    day: props.data.getExtraStat<HighestUsageResult>(highestUsageKey).day!,
    title: format(
      props.data.getExtraStat<HighestUsageResult>(highestUsageKey).day?.date!
    ),
  },
  {
    label: "Highest grid & battery usage",
    day: props.data.getExtraStat<HighestGridUsageResult>(highestGridUsageKey)
      .day!,
    title: format(
      props.data.getExtraStat<HighestGridUsageResult>(highestGridUsageKey).day
        ?.date!
    ),
  },
];

const selectedOption = ref<any>(options[0]);

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
          active: option.label === selectedOption.label,
        }"
        @click="select(option)"
      >
        {{ option.label }}
      </button>
    </div>
    <div class="detail">
      <Header :title="selectedOption.title">
        {{ selectedOption.description }}
      </Header>
      <DayChart
        :day="selectedOption.day!"
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
