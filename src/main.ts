import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import mitt from 'mitt';
const emitter = mitt();
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options';
import "quasar/dist/quasar.sass";

const app = createApp(App).use(Quasar, quasarUserOptions);

app.use(router)

app.config.globalProperties.emitter = emitter;

app.mount('#app')
