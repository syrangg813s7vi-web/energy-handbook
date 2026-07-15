import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import EnergyFlowDemo from "./components/EnergyFlowDemo.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("EnergyFlowDemo", EnergyFlowDemo);
  },
} satisfies Theme;
