<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Delete, Document, Medal, Cpu, Tickets, Trophy } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchAchievements, deleteAchievement, type AchievementQuery } from '@/mock/api'
import type { Achievement, AchievementType, ProjectLevel } from '@/types'
import { AchievementTypeMap, ProjectLevelMap } from '@/types'

const loading = ref(false)
const list = ref<Achievement[]>([])
const total = ref(0)

const query = reactive<AchievementQuery>({
  page: 1,
  pageSize: 10,
  keyword: '',
  type: '',
})

const typeMeta: Record<AchievementType, { icon: unknown; color: string }> = {
  paper: { icon: Document, color: '#409eff' },
  patent: { icon: Medal, color: '#f56c6c' },
  software: { icon: Cpu, color: '#67c23a' },
  standard: { icon: Tickets, color: '#e6a23c' },
  award: { icon: Trophy, color: '#9c27b0' },
}

const statusMeta: Record<Achievement['status'], { label: string; type: 'info' | 'warning' | 'success' }> = {
  draft: { label: '草稿', type: 'info' },
  reviewing: { label: '审核中', type: 'warning' },
  approved: { label: '已认定', type: 'success' },
}

const levelTagType: Record<ProjectLevel, 'danger' | 'warning' | 'primary' | 'info'> = {
  national: 'danger',
  provincial: 'warning',
  municipal: 'primary',
  enterprise: 'info',
}

async function loadData() {
  loading.value = true
  try {
    const res = await fetchAchievements(query)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.keyword = ''
  query.type = ''
  query.page = 1
  loadData()
}

async function handleDelete(row: Achievement) {
  await ElMessageBox.confirm(`确定删除成果「${row.title}」吗？`, '删除确认', {
    type: 'warning',
  })
  await deleteAchievement(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <el-card shadow="never" class="card-gap">
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="成果名称 / 作者"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.type" placeholder="全部" clearable style="width: 150px">
            <el-option
              v-for="(label, value) in AchievementTypeMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="table-title card-gap">科研成果（共 {{ total }} 项）</div>
      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <span class="type-cell">
              <el-icon :size="18" :color="typeMeta[row.type as AchievementType].color">
                <component :is="typeMeta[row.type as AchievementType].icon" />
              </el-icon>
              {{ AchievementTypeMap[row.type as AchievementType] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="成果名称" min-width="280" show-overflow-tooltip />
        <el-table-column prop="author" label="第一完成人" width="110" align="center" />
        <el-table-column prop="department" label="所属部门" width="150" show-overflow-tooltip />
        <el-table-column label="级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="levelTagType[row.level as ProjectLevel]" effect="plain">
              {{ ProjectLevelMap[row.level as ProjectLevel] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishDate" label="日期" width="120" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMeta[row.status as Achievement['status']].type">
              {{ statusMeta[row.status as Achievement['status']].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="handleSearch"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.filter-bar {
  margin-bottom: -18px;
}
.table-title {
  font-size: 15px;
  font-weight: 600;
}
.type-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
