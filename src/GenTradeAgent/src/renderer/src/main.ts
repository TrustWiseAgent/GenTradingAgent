import './assets/main.css'

import { createApp } from 'vue'
import { store, keyStore } from './store'

import App from './App.vue'

const app = createApp(App)
app.use(store, keyStore)
app.mount('#app')

window.electron.ipcRenderer.invoke('getOhlcvDB').then((response) => {
  store.commit('updateOhlcvDB', response)
})
