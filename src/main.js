import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

document.cookie = 'SF_cookie_11 = 78087231'
document.cookie = 'orgType = 2'
document.cookie = 'orgId = 6904'
// document.cookie = 'SESSION = ZjdmNGFiZDgtYmNkZC00NDA3LWI0MGEtNmYwNmRmZWI3MTBh'

createApp(App).use(ElementPlus).mount('#app')
