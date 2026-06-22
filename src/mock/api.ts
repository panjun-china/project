import type {
  Project,
  Achievement,
  Talent,
  FundRecord,
  TodoItem,
  NoticeItem,
  PageQuery,
  PageResult,
} from '@/types'
import {
  projects as projectSeed,
  achievements as achievementSeed,
  talents as talentSeed,
  fundRecords as fundSeed,
  todos as todoSeed,
  notices as noticeSeed,
} from './data'

/** 模拟网络延迟 */
function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

/** 内存数据副本，支持增删改 */
const db = {
  projects: [...projectSeed],
  achievements: [...achievementSeed],
  talents: [...talentSeed],
  funds: [...fundSeed],
  todos: [...todoSeed],
  notices: [...noticeSeed],
}

function paginate<T>(source: T[], query: PageQuery): PageResult<T> {
  const start = (query.page - 1) * query.pageSize
  return {
    list: source.slice(start, start + query.pageSize),
    total: source.length,
  }
}

// ============ 项目 ============

export interface ProjectQuery extends PageQuery {
  status?: string
  level?: string
}

export function fetchProjects(query: ProjectQuery): Promise<PageResult<Project>> {
  let list = db.projects
  if (query.keyword) {
    const kw = query.keyword.trim()
    list = list.filter(
      (p) => p.name.includes(kw) || p.leader.includes(kw) || p.code.includes(kw)
    )
  }
  if (query.status) list = list.filter((p) => p.status === query.status)
  if (query.level) list = list.filter((p) => p.level === query.level)
  return delay(paginate(list, query))
}

export function saveProject(project: Project): Promise<Project> {
  const idx = db.projects.findIndex((p) => p.id === project.id)
  if (idx >= 0) {
    db.projects[idx] = project
  } else {
    db.projects.unshift(project)
  }
  return delay(project)
}

export function deleteProject(id: string): Promise<boolean> {
  db.projects = db.projects.filter((p) => p.id !== id)
  return delay(true)
}

// ============ 成果 ============

export interface AchievementQuery extends PageQuery {
  type?: string
}

export function fetchAchievements(
  query: AchievementQuery
): Promise<PageResult<Achievement>> {
  let list = db.achievements
  if (query.keyword) {
    const kw = query.keyword.trim()
    list = list.filter(
      (a) => a.title.includes(kw) || a.author.includes(kw)
    )
  }
  if (query.type) list = list.filter((a) => a.type === query.type)
  return delay(paginate(list, query))
}

export function deleteAchievement(id: string): Promise<boolean> {
  db.achievements = db.achievements.filter((a) => a.id !== id)
  return delay(true)
}

// ============ 人才 ============

export interface TalentQuery extends PageQuery {
  title?: string
}

export function fetchTalents(query: TalentQuery): Promise<PageResult<Talent>> {
  let list = db.talents
  if (query.keyword) {
    const kw = query.keyword.trim()
    list = list.filter(
      (t) => t.name.includes(kw) || t.field.includes(kw) || t.department.includes(kw)
    )
  }
  if (query.title) list = list.filter((t) => t.title === query.title)
  return delay(paginate(list, query))
}

// ============ 经费 ============

export interface FundQuery extends PageQuery {
  flowType?: string
  status?: string
}

export function fetchFunds(query: FundQuery): Promise<PageResult<FundRecord>> {
  let list = db.funds
  if (query.keyword) {
    const kw = query.keyword.trim()
    list = list.filter(
      (f) => f.projectName.includes(kw) || f.applicant.includes(kw)
    )
  }
  if (query.flowType) list = list.filter((f) => f.flowType === query.flowType)
  if (query.status) list = list.filter((f) => f.status === query.status)
  return delay(paginate(list, query))
}

export function updateFundStatus(
  id: string,
  status: FundRecord['status']
): Promise<boolean> {
  const target = db.funds.find((f) => f.id === id)
  if (target) target.status = status
  return delay(true)
}

// ============ 工作台 ============

export interface DashboardStats {
  projectTotal: number
  ongoingProjects: number
  achievementTotal: number
  talentTotal: number
  totalBudget: number
  totalSpent: number
  /** 项目状态分布 */
  statusDistribution: { name: string; value: number }[]
  /** 成果类型分布 */
  achievementDistribution: { name: string; value: number }[]
  /** 各部门项目数 */
  departmentProjects: { name: string; value: number }[]
  /** 近6个月经费支出趋势 */
  fundTrend: { month: string; income: number; expense: number }[]
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  const statusGroup: Record<string, number> = {}
  for (const p of db.projects) {
    statusGroup[p.status] = (statusGroup[p.status] ?? 0) + 1
  }
  const typeGroup: Record<string, number> = {}
  for (const a of db.achievements) {
    typeGroup[a.type] = (typeGroup[a.type] ?? 0) + 1
  }
  const deptGroup: Record<string, number> = {}
  for (const p of db.projects) {
    deptGroup[p.department] = (deptGroup[p.department] ?? 0) + 1
  }

  const stats: DashboardStats = {
    projectTotal: db.projects.length,
    ongoingProjects: db.projects.filter((p) => p.status === 'ongoing').length,
    achievementTotal: db.achievements.length,
    talentTotal: db.talents.length,
    totalBudget: db.projects.reduce((s, p) => s + p.budget, 0),
    totalSpent: db.projects.reduce((s, p) => s + p.spent, 0),
    statusDistribution: Object.entries(statusGroup).map(([name, value]) => ({
      name,
      value,
    })),
    achievementDistribution: Object.entries(typeGroup).map(([name, value]) => ({
      name,
      value,
    })),
    departmentProjects: Object.entries(deptGroup).map(([name, value]) => ({
      name,
      value,
    })),
    fundTrend: [
      { month: '1月', income: 250, expense: 120 },
      { month: '2月', income: 80, expense: 95 },
      { month: '3月', income: 0, expense: 88 },
      { month: '4月', income: 80, expense: 64 },
      { month: '5月', income: 0, expense: 110 },
      { month: '6月', income: 150, expense: 132 },
    ],
  }
  return delay(stats)
}

export function fetchTodos(): Promise<TodoItem[]> {
  return delay([...db.todos])
}

export function toggleTodo(id: string): Promise<boolean> {
  const t = db.todos.find((item) => item.id === id)
  if (t) t.done = !t.done
  return delay(true)
}

export function fetchNotices(): Promise<NoticeItem[]> {
  return delay([...db.notices])
}
