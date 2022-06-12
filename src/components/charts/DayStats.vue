<script setup lang="ts">
import { ref, watch } from "vue";
import Day from "../../data/Day";
import { formatPower, formatPercentage } from "../../util/Formatter";

const props = defineProps<{ day: Day }>();

const stats = ref(props.day.getStats());
const rechargeEmoji = ref(
  stats.value.totalProduced > stats.value.totalUsed ? "✅" : "❌"
);

watch([() => props.day], ([newDay]) => {
  stats.value = newDay.getStats();
  rechargeEmoji.value =
    stats.value.totalProduced > stats.value.totalUsed ? "✅" : "❌";
});
</script>

<template>
  <ul class="stats">
    <li>
      <span class="icon">☀️</span> Used right away:
      {{ formatPower(stats.totalSelfUsed) }} ({{
        formatPercentage(stats.solarPercentage)
      }}
      )
    </li>
    <li>
      <span class="icon">🔋</span> Used from battery:
      {{ formatPower(stats.totalDischarged) }} ({{
        formatPercentage(stats.batteryPercentage)
      }}
      )
    </li>
    <li>
      <span class="icon">⚡</span> Used from grid:
      {{ formatPower(stats.gridPower) }} ({{
        formatPercentage(stats.gridPercentage)
      }})
    </li>
    <li>
      <span class="icon">{{ rechargeEmoji }}</span> Battery recharged
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.stats {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  li {
    display: flex;
    align-items: center;
    width: 385px;

    .icon {
      font-size: 36px;
      margin-right: 8px;
    }
  }
}
</style>
