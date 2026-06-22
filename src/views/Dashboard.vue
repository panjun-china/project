<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Files,
  Loading,
  Trophy,
  UserFilled,
  Clock,
  Bell,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import StatCard from '@/components/StatCard.vue'
import BaseChart from '@/components/BaseChart.vue'
import {
  fetchDashboardStats,
  fetchTodos,
  fetchNotices,
  toggleTodo,
  type DashboardStats,
} from '@/mock/api'
import type { TodoItem, NoticeItem } from '@/types'
import { ProjectStatusMap, AchievementTypeMap } from '@/types'

const router = useRouter()
const loading = ref(true)
const stats = ref<DashboardStats>()
const todos = ref<TodoItem[]>([])
const notices = ref<NoticeItem[]>([])

const budgetUsage = computed(() => {
  if (!stats.value || stats.value.totalBudget === 0) return 0
  return Math.round((stats.value.totalSpent / stats.value.totalBudget) * 100)
})

const statusPieOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, left: 'center' },
  series: [
    {
      name: '项目状态',
      type: 'pie',
      radius: ['40%', '65%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data:
        stats.value?.statusDistribution.map((s) => ({
          value: s.value,
          name: ProjectStatusMap[s.name as keyof typeof ProjectStatusMap] ?? s.name,
        })) ?? [],
    },
  ],
}))

const achievementPieOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, left: 'center' },
  series: [
    {
      name: '成果类型',
      type: 'pie',
      radius: '60%',
      label: { show: false },
      data:
        stats.value?.achievementDistribution.map((s) => ({
          value: s.value,
          name: AchievementTypeMap[s.name as keyof typeof AchievementTypeMap] ?? s.name,
        })) ?? [],
    },
  ],
}))

const fundTrendOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['拨款', '支出'], top: 0 },
  grid: { left: 40, right: 20, top: 40, bottom: 30 },
  xAxis: {
    type: 'category',
    data: stats.value?.fundTrend.map((f) => f.month) ?? [],
  },
  yAxis: { type: 'value', name: '万元' },
  series: [
    {
      name: '拨款',
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.1 },
      data: stats.value?.fundTrend.map((f) => f.income) ?? [],
    },
    {
      name: '支出',
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.1 },
      data: stats.value?.fundTrend.map((f) => f.expense) ?? [],
    },
  ],
}))

const departmentBarOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 130, right: 30, top: 10, bottom: 20 },
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    data: stats.value?.departmentProjects.map((d) => d.name) ?? [],
  },
  series: [
    {
      name: '项目数',
      type: 'bar',
      barWidth: 16,
      itemStyle: { color: '#409eff', borderRadius: [0, 8, 8, 0] },
      data: stats.value?.departmentProjects.map((d) => d.value) ?? [],
    },
  ],
}))

const priorityMeta: Record<TodoItem['priority'], { label: string; type: 'danger' | 'warning' | 'info' }> = {
  high: { label: '高', type: 'danger' },
  medium: { label: '中', type: 'warning' },
  low: { label: '低', type: 'info' },
}

const noticeTagType: Record<NoticeItem['category'], 'danger' | 'warning' | 'success' | 'info'> = {
  政策: 'danger',
  申报: 'warning',
  通知: 'success',
  系统: 'info',
}

async function loadData() {
  loading.value = true
  try {
    const [s, t, n] = await Promise.all([
      fetchDashboardStats(),
      fetchTodos(),
      fetchNotices(),
    ])
    stats.value = s
    todos.value = t
    notices.value = n
  } finally {
    loading.value = false
  }
}

async function onToggleTodo(item: TodoItem) {
  await toggleTodo(item.id)
  item.done = !item.done
  ElMessage.success(item.done ? '已完成' : '已恢复')
}

function formatMoney(num: number): string {
  return (num / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

onMounted(loadData)
</script>

<template>
  <div class="page-container" v-loading="loading">
    <!-- 欢迎条 -->
    <el-card class="welcome card-gap" shadow="never">
      <div class="flex-between">
        <div>
          <h2 class="welcome__title">下午好，管理员 👋</h2>
          <p class="welcome__subtitle text-muted">
            今天是 2026-06-22，您有 {{ todos.filter((t) => !t.done).length }} 项待办任务，{{ notices.filter((n) => !n.read).length }} 条未读通知。
          </p>
        </div>
        <el-button type="primary" @click="router.push('/projects')">
          进入项目管理
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="card-gap">
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard title="项目总数" :value="stats?.projectTotal ?? 0" :icon="Files" color="#409eff" suffix="个" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard title="进行中项目" :value="stats?.ongoingProjects ?? 0" :icon="Loading" color="#67c23a" suffix="个" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard title="科研成果" :value="stats?.achievementTotal ?? 0" :icon="Trophy" color="#e6a23c" suffix="项" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <StatCard title="科技人才" :value="stats?.talentTotal ?? 0" :icon="UserFilled" color="#f56c6c" suffix="人" />
      </el-col>
    </el-row>

    <!-- 经费总览 -->
    <el-card class="card-gap" shadow="never">
      <el-row :gutter="24" align="middle">
        <el-col :xs="24" :sm="8">
          <div class="fund-overview">
            <div class="fund-overview__label">总预算</div>
            <div class="fund-overview__value">{{ formatMoney(stats?.totalBudget ?? 0) }} 万元</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="fund-overview">
            <div class="fund-overview__label">已支出</div>
            <div class="fund-overview__value" style="color: #f56c6c">
              {{ formatMoney(stats?.totalSpent ?? 0) }} 万元
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="fund-overview">
            <div class="fund-overview__label">预算执行率</div>
            <el-progress :percentage="budgetUsage" :stroke-width="14" striped striped-flow />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区 -->
    <el-row :gutter="16" class="card-gap">
      <el-col :xs="24" :md="16">
        <el-card shadow="never" header="近半年经费收支趋势">
          <BaseChart :option="fundTrendOption" height="300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" header="项目状态分布">
          <BaseChart :option="statusPieOption" height="300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="card-gap">
      <el-col :xs="24" :md="8">
        <el-card shadow="never" header="科研成果类型分布">
          <BaseChart :option="achievementPieOption" height="300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="16">
        <el-card shadow="never" header="各部门项目数量">
          <BaseChart :option="departmentBarOption" height="300px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办 + 通知 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="14">
        <el-card shadow="never">
          <template #header>
            <div class="flex-between">
              <span><el-icon><Clock /></el-icon> 待办事项</span>
              <el-tag type="danger" effect="plain">
                {{ todos.filter((t) => !t.done).length }} 项待处理
              </el-tag>
            </div>
          </template>
          <div v-for="item in todos" :key="item.id" class="todo-item">
            <el-checkbox :model-value="item.done" @change="onToggleTodo(item)" />
            <div class="todo-item__body" :class="{ 'todo-item__body--done': item.done }">
              <div class="todo-item__title">{{ item.title }}</div>
              <div class="todo-item__meta">
                <el-tag size="small" :type="priorityMeta[item.priority].type" effect="light">
                  {{ priorityMeta[item.priority].label }}优先级
                </el-tag>
                <span class="text-muted">截止 {{ item.deadline }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="10">
        <el-card shadow="never">
          <template #header>
            <span><el-icon><Bell /></el-icon> 通知公告</span>
          </template>
          <div v-for="n in notices" :key="n.id" class="notice-item">
            <el-badge is-dot :hidden="n.read" type="danger">
              <el-tag size="small" :type="noticeTagType[n.category]" effect="plain">
                {{ n.category }}
              </el-tag>
            </el-badge>
            <span class="notice-item__title" :class="{ 'notice-item__title--read': n.read }">
              {{ n.title }}
            </span>
            <span class="notice-item__date text-muted">{{ n.date }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.welcome__title {
  margin: 0 0 6px;
  font-size: 20px;
}
.welcome__subtitle {
  margin: 0;
  font-size: 14px;
}

.fund-overview {
  padding: 8px 0;
}
.fund-overview__label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.fund-overview__value {
  font-size: 24px;
  font-weight: 600;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.todo-item:last-child {
  border-bottom: none;
}
.todo-item__body--done .todo-item__title {
  text-decoration: line-through;
  color: #c0c4cc;
}
.todo-item__title {
  font-size: 14px;
  margin-bottom: 6px;
}
.todo-item__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.notice-item:last-child {
  border-bottom: none;
}
.notice-item__title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notice-item__title--read {
  color: #909399;
}
.notice-item__date {
  font-size: 12px;
  flex-shrink: 0;
}
</style>
