import Vue from 'vue'
import Router from 'vue-router'
import Lisence from '@/components/Lisence'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Lisence',
      component: Lisence
    }
  ]
})
