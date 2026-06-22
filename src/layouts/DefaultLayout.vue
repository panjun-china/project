<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Fold,
  Expand,
  Odometer,
  Files,
  Trophy,
  UserFilled,
  Money,
  Bell,
  FullScreen,
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

interface MenuItem {
  index: string
  title: string
  icon: unknown
}

const menus: MenuItem[] = [
  { index: '/dashboard', title: '工作台', icon: Odometer },
  { index: '/projects', title: '科技项目', icon: Files },
  { index: '/achievements', title: '科研成果', icon: Trophy },
  { index: '/talents', title: '科技人才', icon: UserFilled },
  { index: '/funds', title: '经费管理', icon: Money },
]

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => (route.meta.title as string) ?? '')

function handleSelect(index: string) {
  router.push(index)
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}
</script>

<template>
  <el-container class="layout">
    <el-aside
      class="layout__aside"
      :width="appStore.sidebarCollapsed ? 'var(--app-sidebar-collapsed-width)' : 'var(--app-sidebar-width)'"
    >
      <div class="logo">
        <el-icon :size="26" color="#ffffff"><Odometer /></el-icon>
        <span v-show="!appStore.sidebarCollapsed" class="logo__text">科技管理工作台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="#001529"
        text-color="#a6adb4"
        active-text-color="#ffffff"
        @select="handleSelect"
      >
        <el-menu-item v-for="m in menus" :key="m.index" :index="m.index">
          <el-icon><component :is="m.icon" /></el-icon>
          <template #title>{{ m.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout__header">
        <div class="header-left">
          <el-icon class="trigger" :size="20" @click="appStore.toggleSidebar">
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-icon class="action-icon" :size="18" @click="toggleFullscreen">
            <FullScreen />
          </el-icon>
          <el-badge :value="3" class="action-badge">
            <el-icon class="action-icon" :size="18"><Bell /></el-icon>
          </el-badge>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ appStore.currentUser.name.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ appStore.currentUser.name }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>系统设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout__main">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100%;
}

.layout__aside {
  background-color: #001529;
  transition: width 0.25s;
  overflow-x: hidden;
}

.logo {
  height: var(--app-header-height);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  color: #fff;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo__text {
  font-size: 16px;
  font-weight: 600;
}

.layout__aside :deep(.el-menu) {
  border-right: none;
}

.layout__header {
  height: var(--app-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  cursor: pointer;
  color: #5a5e66;
}
.trigger:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.action-icon {
  cursor: pointer;
  color: #5a5e66;
}
.action-icon:hover {
  color: #409eff;
}

.action-badge :deep(.el-badge__content) {
  top: 6px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}

.user-avatar {
  background: #409eff;
  color: #fff;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.layout__main {
  background: var(--app-bg);
  padding: 0;
  overflow-y: auto;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
