import { darkestPeriod } from "./DarkestPeriod";
import { earliestSunshine } from "./EarliestSunshine";
import { latestSunshine } from "./LatestSunshine";
import { sunniestDay } from "./SunniestDay";
import { yearSelfSufficiency } from "./YearSelfSufficiency";
import { highestUsage } from "./HighestUsage";
import { highestGridUsage } from "./HighestGridUsage";

const EXTENSIONS = [
  darkestPeriod,
  sunniestDay,
  yearSelfSufficiency,
  earliestSunshine,
  latestSunshine,
  highestUsage,
  highestGridUsage,
];
export default EXTENSIONS;
