import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import EnergyFlowDemo from "./components/EnergyFlowDemo.vue";
import ReviewLayer from "./components/ReviewLayer.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    "layout-bottom": () => h(ReviewLayer),
  }),
  enhanceApp({ app }) {
    app.component("EnergyFlowDemo", EnergyFlowDemo);
  },
} satisfies Theme;
