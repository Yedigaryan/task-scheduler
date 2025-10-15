import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from "./routes/index";
import App from "./App.vue";
import './assets/main.css';

createApp(App).use(createPinia()).use(router).use(ElementPlus).mount("#app");
