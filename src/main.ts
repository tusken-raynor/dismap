import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import store from "./store";
import storage from "./storage";

// Setup local storage handling
storage.useStore(store);

// Create the app and mount to the DOM
createApp(App).use(store).mount("#app");