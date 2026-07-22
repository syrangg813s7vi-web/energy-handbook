import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import EnergyFlowDemo from "./components/EnergyFlowDemo.vue";
import EnergyManagementDemo from "./components/EnergyManagementDemo.vue";
import EnergySystemRoles from "./components/EnergySystemRoles.vue";
import FocusReadingToggle from "./components/FocusReadingToggle.vue";
import BlackStartDemo from "./components/configurations/BlackStartDemo.vue";
import FaultRecordDemo from "./components/configurations/FaultRecordDemo.vue";
import GridConnectedControlDemo from "./components/configurations/GridConnectedControlDemo.vue";
import GridPointDataSelectionDemo from "./components/configurations/GridPointDataSelectionDemo.vue";
import GridSwitchControlDemo from "./components/configurations/GridSwitchControlDemo.vue";
import OffGridControlDemo from "./components/configurations/OffGridControlDemo.vue";
import OverAdjustmentDetectionDemo from "./components/configurations/OverAdjustmentDetectionDemo.vue";
import PerUnitValueDemo from "./components/configurations/PerUnitValueDemo.vue";
import PhotovoltaicBalancingDemo from "./components/configurations/PhotovoltaicBalancingDemo.vue";
import PvStorageVariableAllocationDemo from "./components/configurations/PvStorageVariableAllocationDemo.vue";
import SampleDataManagerDemo from "./components/configurations/SampleDataManagerDemo.vue";
import ReviewLayer from "./components/ReviewLayer.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    "layout-bottom": () => [
      h(FocusReadingToggle),
      h(ReviewLayer),
    ],
  }),
  enhanceApp({ app }) {
    app.component("EnergyFlowDemo", EnergyFlowDemo);
    app.component("EnergyManagementDemo", EnergyManagementDemo);
    app.component("EnergySystemRoles", EnergySystemRoles);
    app.component("GridPointDataSelectionDemo", GridPointDataSelectionDemo);
    app.component("PhotovoltaicBalancingDemo", PhotovoltaicBalancingDemo);
    app.component("PerUnitValueDemo", PerUnitValueDemo);
    app.component("OverAdjustmentDetectionDemo", OverAdjustmentDetectionDemo);
    app.component("PvStorageVariableAllocationDemo", PvStorageVariableAllocationDemo);
    app.component("OffGridControlDemo", OffGridControlDemo);
    app.component("GridConnectedControlDemo", GridConnectedControlDemo);
    app.component("GridSwitchControlDemo", GridSwitchControlDemo);
    app.component("BlackStartDemo", BlackStartDemo);
    app.component("FaultRecordDemo", FaultRecordDemo);
    app.component("SampleDataManagerDemo", SampleDataManagerDemo);
  },
} satisfies Theme;
