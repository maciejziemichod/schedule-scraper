import { createApp } from "vue";
import App from "./App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faMoon, faSun, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import tooltip from "./directives/tooltip.js";
import "@/assets/tooltip.css";

library.add(faGithub, faSun, faMoon, faTrashAlt);

const app = createApp(App);
app.component("FontAwesomeIcon", FontAwesomeIcon);
app.directive("tooltip", tooltip);
app.mount("#app");
