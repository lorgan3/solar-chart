import { ChartTypeRegistry, ScaleOptionsByType } from "chart.js";
import { DeepPartial } from "chart.js/types/utils";
import { formatPower } from "./Formatter";

export const getYScale = (
  extraConfig?: Record<string, unknown>
): {
  y: DeepPartial<ScaleOptionsByType<ChartTypeRegistry["bar"]["scales"]>>;
} => ({
  y: {
    min: 0,
    stacked: true,
    ticks: {
      callback: function (value) {
        return formatPower(value as number);
      },
      count: 10,
    },
    ...extraConfig,
  },
});
