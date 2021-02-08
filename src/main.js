import { createApp } from "vue";
import App from "./App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

library.add(faGithub, faSun, faMoon);

const app = createApp(App);
app.component("FontAwesomeIcon", FontAwesomeIcon);
app.mount("#app");
