import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台', icon: 'Odometer' },
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/project/ProjectList.vue'),
        meta: { title: '科技项目', icon: 'Files' },
      },
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('@/views/achievement/AchievementList.vue'),
        meta: { title: '科研成果', icon: 'Trophy' },
      },
      {
        path: 'talents',
        name: 'Talents',
        component: () => import('@/views/talent/TalentList.vue'),
        meta: { title: '科技人才', icon: 'UserFilled' },
      },
      {
        path: 'funds',
        name: 'Funds',
        component: () => import('@/views/fund/FundList.vue'),
        meta: { title: '经费管理', icon: 'Money' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  const title = (to.meta.title as string) ?? ''
  document.title = title ? `${title} - 科技管理工作台` : '科技管理工作台'
})

export default router
