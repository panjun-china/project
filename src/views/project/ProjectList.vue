<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  fetchProjects,
  saveProject,
  deleteProject,
  type ProjectQuery,
} from '@/mock/api'
import type { Project, ProjectStatus, ProjectLevel } from '@/types'
import { ProjectStatusMap, ProjectLevelMap } from '@/types'

const loading = ref(false)
const list = ref<Project[]>([])
const total = ref(0)

const query = reactive<ProjectQuery>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  level: '',
})

const statusTagType: Record<ProjectStatus, 'info' | 'primary' | 'warning' | 'success' | 'danger'> = {
  pending: 'info',
  ongoing: 'primary',
  acceptance: 'warning',
  completed: 'success',
  terminated: 'danger',
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
    const res = await fetchProjects(query)
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
  query.status = ''
  query.level = ''
  query.page = 1
  loadData()
}

// ====== 新增 / 编辑 ======
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const form = reactive<Project>(emptyProject())

function emptyProject(): Project {
  return {
    id: '',
    code: '',
    name: '',
    level: 'provincial',
    status: 'pending',
    leader: '',
    department: '',
    budget: 0,
    spent: 0,
    progress: 0,
    startDate: '',
    endDate: '',
    members: 1,
    description: '',
  }
}

const rules: FormRules<Project> = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
  leader: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  department: [{ required: true, message: '请输入承担部门', trigger: 'blur' }],
  budget: [{ required: true, message: '请输入预算', trigger: 'blur' }],
}

function openCreate() {
  dialogMode.value = 'create'
  Object.assign(form, emptyProject())
  form.id = 'P' + Date.now()
  dialogVisible.value = true
}

function openEdit(row: Project) {
  dialogMode.value = 'edit'
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    await saveProject({ ...form })
    ElMessage.success(dialogMode.value === 'create' ? '创建成功' : '更新成功')
    dialogVisible.value = false
    loadData()
  })
}

async function handleDelete(row: Project) {
  await ElMessageBox.confirm(
    `确定删除项目「${row.name}」吗？此操作不可恢复。`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  )
  await deleteProject(row.id)
  ElMessage.success('删除成功')
  if (list.value.length === 1 && query.page > 1) query.page--
  loadData()
}

function progressColor(p: number): string {
  if (p >= 80) return '#67c23a'
  if (p >= 40) return '#409eff'
  return '#e6a23c'
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <el-card shadow="never" class="card-gap">
      <!-- 筛选栏 -->
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="项目名称 / 负责人 / 编号"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="(label, value) in ProjectStatusMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="query.level" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="(label, value) in ProjectLevelMap"
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
      <div class="flex-between card-gap">
        <span class="table-title">项目列表（共 {{ total }} 个）</span>
        <el-button type="primary" :icon="Plus" @click="openCreate">新建项目</el-button>
      </div>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="code" label="编号" width="130" />
        <el-table-column prop="name" label="项目名称" min-width="240" show-overflow-tooltip />
        <el-table-column label="级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="levelTagType[row.level as ProjectLevel]" effect="plain">
              {{ ProjectLevelMap[row.level as ProjectLevel] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status as ProjectStatus]">
              {{ ProjectStatusMap[row.status as ProjectStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" width="90" align="center" />
        <el-table-column label="预算(万)" width="100" align="right">
          <template #default="{ row }">{{ (row.budget / 10000).toFixed(0) }}</template>
        </el-table-column>
        <el-table-column label="进度" width="160">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :color="progressColor(row.progress)"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="openEdit(row)">编辑</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建项目' : '编辑项目'"
      width="640px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="项目编号" prop="code">
              <el-input v-model="form.code" placeholder="如 KJ-2025-001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="承担部门" prop="department">
              <el-input v-model="form.department" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="团队人数">
              <el-input-number v-model="form.members" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="级别">
              <el-select v-model="form.level" style="width: 100%">
                <el-option
                  v-for="(label, value) in ProjectLevelMap"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option
                  v-for="(label, value) in ProjectStatusMap"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="预算(元)" prop="budget">
              <el-input-number v-model="form.budget" :min="0" :step="100000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进度(%)">
              <el-input-number v-model="form.progress" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始日期">
              <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期">
              <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="项目简介">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
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
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
