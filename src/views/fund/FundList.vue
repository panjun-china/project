<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh, Check, Close, Top, Bottom } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchFunds, updateFundStatus, type FundQuery } from '@/mock/api'
import type { FundRecord } from '@/types'

const loading = ref(false)
const list = ref<FundRecord[]>([])
const total = ref(0)

const query = reactive<FundQuery>({
  page: 1,
  pageSize: 10,
  keyword: '',
  flowType: '',
  status: '',
})

const statusMeta: Record<FundRecord['status'], { label: string; type: 'warning' | 'success' | 'danger' }> = {
  pending: { label: '待审批', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
}

const summary = computed(() => {
  const income = list.value
    .filter((f) => f.flowType === 'income')
    .reduce((s, f) => s + f.amount, 0)
  const expense = list.value
    .filter((f) => f.flowType === 'expense')
    .reduce((s, f) => s + f.amount, 0)
  const pending = list.value.filter((f) => f.status === 'pending').length
  return { income, expense, pending }
})

async function loadData() {
  loading.value = true
  try {
    const res = await fetchFunds(query)
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
  query.flowType = ''
  query.status = ''
  query.page = 1
  loadData()
}

async function handleReview(row: FundRecord, status: 'approved' | 'rejected') {
  const action = status === 'approved' ? '通过' : '驳回'
  await ElMessageBox.confirm(`确定${action}该笔经费申请吗？`, `${action}确认`, {
    type: status === 'approved' ? 'success' : 'warning',
  })
  await updateFundStatus(row.id, status)
  ElMessage.success(`已${action}`)
  loadData()
}

function formatAmount(num: number): string {
  return num.toLocaleString('zh-CN')
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <!-- 汇总卡片 -->
    <el-row :gutter="16" class="card-gap">
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="sum-card">
          <div class="sum-card__inner">
            <el-icon :size="32" color="#67c23a"><Top /></el-icon>
            <div>
              <div class="text-muted">本页拨款合计</div>
              <div class="sum-card__value" style="color: #67c23a">
                ¥ {{ formatAmount(summary.income) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="sum-card">
          <div class="sum-card__inner">
            <el-icon :size="32" color="#f56c6c"><Bottom /></el-icon>
            <div>
              <div class="text-muted">本页支出合计</div>
              <div class="sum-card__value" style="color: #f56c6c">
                ¥ {{ formatAmount(summary.expense) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="sum-card">
          <div class="sum-card__inner">
            <el-icon :size="32" color="#e6a23c"><Search /></el-icon>
            <div>
              <div class="text-muted">待审批笔数</div>
              <div class="sum-card__value" style="color: #e6a23c">
                {{ summary.pending }} 笔
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="card-gap">
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="项目名称 / 申请人"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.flowType" placeholder="全部" clearable style="width: 120px">
            <el-option label="拨款" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="table-title card-gap">经费明细（共 {{ total }} 笔）</div>
      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="projectName" label="所属项目" min-width="240" show-overflow-tooltip />
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.flowType === 'income' ? 'success' : 'danger'" effect="plain">
              {{ row.flowType === 'income' ? '拨款' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="费用类别" width="120" align="center" />
        <el-table-column label="金额(元)" width="140" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.flowType === 'income' ? '#67c23a' : '#f56c6c', fontWeight: 600 }">
              {{ row.flowType === 'income' ? '+' : '-' }}{{ formatAmount(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="90" align="center" />
        <el-table-column prop="date" label="日期" width="120" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMeta[row.status as FundRecord['status']].type">
              {{ statusMeta[row.status as FundRecord['status']].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="success" link :icon="Check" @click="handleReview(row, 'approved')">通过</el-button>
              <el-button type="danger" link :icon="Close" @click="handleReview(row, 'rejected')">驳回</el-button>
            </template>
            <span v-else class="text-muted">已处理</span>
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
.sum-card__inner {
  display: flex;
  align-items: center;
  gap: 16px;
}
.sum-card__value {
  font-size: 22px;
  font-weight: 600;
  margin-top: 4px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
