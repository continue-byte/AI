import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { useAuthStore } from './stores/auth.js'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 在路由挂载前恢复登录态（Pinia 已可用）
const auth = useAuthStore()
auth.init()

app.use(router)
app.mount('#app')
