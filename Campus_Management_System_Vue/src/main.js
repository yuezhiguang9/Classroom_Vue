import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import 'font-awesome/css/font-awesome.min.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import axios from '@/utils/axios';
// 创建应用实例并配置
const app = createApp(App);
app.use(router)
   .use(ElementPlus);



// 只挂载一次应用
app.mount("#app");