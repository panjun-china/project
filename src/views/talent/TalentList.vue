<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Message, Phone, Calendar } from '@element-plus/icons-vue'
import { fetchTalents, type TalentQuery } from '@/mock/api'
import type { Talent, Title } from '@/types'
import { TitleMap } from '@/types'

const loading = ref(false)
const list = ref<Talent[]>([])
const total = ref(0)

const query = reactive<TalentQuery>({
  page: 1,
  pageSize: 12,
  keyword: '',
  title: '',
})

const titleTagType: Record<Title, 'info' | 'primary' | 'warning' | 'danger'> = {
  junior: 'info',
  intermediate: 'primary',
  senior: 'warning',
  professor: 'danger',
}

const avatarColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9c27b0', '#13c2c2']
function avatarColor(name: string): string {
  let sum = 0
  for (const ch of name) sum += ch.charCodeAt(0)
  return avatarColors[sum % avatarColors.length]
}

async function loadData() {
  loading.value = true
  try {
    const res = await fetchTalents(query)
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
  query.title = ''
  query.page = 1
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
            placeholder="姓名 / 研究方向 / 部门"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="职称">
          <el-select v-model="query.title" placeholder="全部" clearable style="width: 160px">
            <el-option
              v-for="(label, value) in TitleMap"
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

    <div v-loading="loading">
      <el-row :gutter="16">
        <el-col v-for="t in list" :key="t.id" :xs="24" :sm="12" :md="8" :lg="6" class="card-gap">
          <el-card shadow="hover" class="talent-card">
            <div class="talent-card__head">
              <el-avatar :size="56" :style="{ background: avatarColor(t.name) }">
                {{ t.name.charAt(0) }}
              </el-avatar>
              <div class="talent-card__title">
                <div class="talent-card__name">
                  {{ t.name }}
                  <el-tag size="small" :type="titleTagType[t.title as Title]" effect="dark">
                    {{ TitleMap[t.title as Title] }}
                  </el-tag>
                </div>
                <div class="text-muted talent-card__dept">{{ t.department }}</div>
              </div>
            </div>

            <div class="talent-card__field">
              研究方向：<strong>{{ t.field }}</strong>
            </div>

            <el-row class="talent-card__stats">
              <el-col :span="12" class="stat-item">
                <div class="stat-item__num">{{ t.projectCount }}</div>
                <div class="text-muted">承担项目</div>
              </el-col>
              <el-col :span="12" class="stat-item">
                <div class="stat-item__num">{{ t.achievementCount }}</div>
                <div class="text-muted">科研成果</div>
              </el-col>
            </el-row>

            <div class="talent-card__contact">
              <div><el-icon><Message /></el-icon> {{ t.email }}</div>
              <div><el-icon><Phone /></el-icon> {{ t.phone }}</div>
              <div><el-icon><Calendar /></el-icon> 入职 {{ t.joinDate }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="!loading && list.length === 0" description="暂无人才数据" />

      <div class="pagination">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @current-change="loadData"
          @size-change="handleSearch"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  margin-bottom: -18px;
}
.talent-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.talent-card__name {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.talent-card__dept {
  font-size: 13px;
  margin-top: 4px;
}
.talent-card__field {
  margin: 14px 0;
  font-size: 13px;
  color: #606266;
}
.talent-card__stats {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 12px 0;
  margin-bottom: 14px;
}
.stat-item {
  text-align: center;
  font-size: 12px;
}
.stat-item__num {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 2px;
}
.talent-card__contact {
  font-size: 12px;
  color: #909399;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.talent-card__contact > div {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
