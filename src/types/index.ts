// ============ 通用类型 ============

/** 分页查询参数 */
export interface PageQuery {
  page: number
  pageSize: number
  keyword?: string
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[]
  total: number
}

// ============ 科技项目 ============

/** 项目状态 */
export const ProjectStatusMap = {
  pending: '待立项',
  ongoing: '进行中',
  acceptance: '验收中',
  completed: '已结题',
  terminated: '已终止',
} as const

export type ProjectStatus = keyof typeof ProjectStatusMap

/** 项目级别 */
export const ProjectLevelMap = {
  national: '国家级',
  provincial: '省部级',
  municipal: '市厅级',
  enterprise: '企业级',
} as const

export type ProjectLevel = keyof typeof ProjectLevelMap

/** 科技项目 */
export interface Project {
  id: string
  code: string
  name: string
  level: ProjectLevel
  status: ProjectStatus
  leader: string
  department: string
  budget: number
  spent: number
  progress: number
  startDate: string
  endDate: string
  members: number
  description?: string
}

// ============ 科研成果 ============

/** 成果类型 */
export const AchievementTypeMap = {
  paper: '学术论文',
  patent: '发明专利',
  software: '软件著作权',
  standard: '技术标准',
  award: '科技奖励',
} as const

export type AchievementType = keyof typeof AchievementTypeMap

/** 科研成果 */
export interface Achievement {
  id: string
  title: string
  type: AchievementType
  author: string
  department: string
  projectName: string
  level: ProjectLevel
  publishDate: string
  status: 'draft' | 'reviewing' | 'approved'
}

// ============ 科技人才 ============

/** 职称 */
export const TitleMap = {
  junior: '助理研究员',
  intermediate: '中级研究员',
  senior: '副研究员',
  professor: '研究员',
} as const

export type Title = keyof typeof TitleMap

/** 科技人才 */
export interface Talent {
  id: string
  name: string
  avatar: string
  title: Title
  department: string
  field: string
  projectCount: number
  achievementCount: number
  email: string
  phone: string
  joinDate: string
}

// ============ 经费 ============

/** 经费记录类型 */
export type FundFlowType = 'income' | 'expense'

/** 经费记录 */
export interface FundRecord {
  id: string
  projectName: string
  flowType: FundFlowType
  category: string
  amount: number
  applicant: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  remark?: string
}

// ============ 工作台 ============

/** 待办事项 */
export interface TodoItem {
  id: string
  title: string
  type: 'project' | 'achievement' | 'fund' | 'review'
  priority: 'high' | 'medium' | 'low'
  deadline: string
  done: boolean
}

/** 动态通知 */
export interface NoticeItem {
  id: string
  title: string
  category: '政策' | '通知' | '申报' | '系统'
  date: string
  read: boolean
}
