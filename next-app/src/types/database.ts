export interface OrderProperties {
  起案者?: string
  総支給額?: number
  職務範囲?: string
  "時間/数量"?: number
  MB担当者名?: string
  業務レベル?: string
  発注決裁名?: string
  "納期/シフト"?: string
  "時給/数量単価"?: number
  "勤務時間(クール)"?: string
  "発注科目/依頼業務"?: string[]
}

export interface NotionOrder {
  id: string
  notion_id: string
  properties: OrderProperties
  notion_created_at: string
  notion_updated_at: string
  created_at: string
  updated_at: string
  synced_at: string
}

// Budget types
export type DimensionType = "jobScope" | "jobLevel" | "orderCategory"

export interface Budget {
  id: string
  year_month: string
  dimension_type: DimensionType
  dimension_value: string
  amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      notion_orders: {
        Row: NotionOrder
        Insert: Omit<NotionOrder, "id" | "created_at" | "updated_at" | "synced_at">
        Update: Partial<Omit<NotionOrder, "id">>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Budget, "id">>
      }
    }
  }
}

// Japanese national holidays
function getJapaneseHolidays(year: number): Set<string> {
  const holidays = new Set<string>()

  // Fixed holidays
  const fixedHolidays = [
    [1, 1],   // 元日
    [2, 11],  // 建国記念の日
    [2, 23],  // 天皇誕生日
    [4, 29],  // 昭和の日
    [5, 3],   // 憲法記念日
    [5, 4],   // みどりの日
    [5, 5],   // こどもの日
    [8, 11],  // 山の日
    [11, 3],  // 文化の日
    [11, 23], // 勤労感謝の日
  ]

  fixedHolidays.forEach(([month, day]) => {
    holidays.add(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
  })

  // Variable holidays (nth Monday of month)
  // 成人の日: 1月第2月曜
  holidays.add(getNthWeekday(year, 1, 1, 2))
  // 海の日: 7月第3月曜
  holidays.add(getNthWeekday(year, 7, 1, 3))
  // 敬老の日: 9月第3月曜
  holidays.add(getNthWeekday(year, 9, 1, 3))
  // スポーツの日: 10月第2月曜
  holidays.add(getNthWeekday(year, 10, 1, 2))

  // 春分の日 (around March 20-21)
  const springEquinox = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  holidays.add(`${year}-03-${String(springEquinox).padStart(2, "0")}`)

  // 秋分の日 (around September 22-23)
  const autumnEquinox = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  holidays.add(`${year}-09-${String(autumnEquinox).padStart(2, "0")}`)

  // 振替休日 (substitute holidays when holiday falls on Sunday)
  const addSubstituteHolidays = () => {
    const originalHolidays = [...holidays]
    originalHolidays.forEach(dateStr => {
      const date = new Date(dateStr)
      if (date.getDay() === 0) { // Sunday
        // Find next weekday that's not already a holiday
        let substitute = new Date(date)
        substitute.setDate(substitute.getDate() + 1)
        while (holidays.has(formatDateString(substitute)) || substitute.getDay() === 0 || substitute.getDay() === 6) {
          substitute.setDate(substitute.getDate() + 1)
        }
        holidays.add(formatDateString(substitute))
      }
    })
  }

  addSubstituteHolidays()

  return holidays
}

// Helper: Get nth weekday of month (e.g., 2nd Monday)
function getNthWeekday(year: number, month: number, dayOfWeek: number, n: number): string {
  const firstDay = new Date(year, month - 1, 1)
  let count = 0
  const date = new Date(firstDay)

  while (count < n) {
    if (date.getDay() === dayOfWeek) {
      count++
      if (count === n) break
    }
    date.setDate(date.getDate() + 1)
  }

  return formatDateString(date)
}

// Helper: Format date as YYYY-MM-DD
function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Cache for holidays by year
const holidayCache = new Map<number, Set<string>>()

// Check if a date is a Japanese holiday
export function isJapaneseHoliday(date: Date): boolean {
  const year = date.getFullYear()
  if (!holidayCache.has(year)) {
    holidayCache.set(year, getJapaneseHolidays(year))
  }
  return holidayCache.get(year)!.has(formatDateString(date))
}

// Check if a date is a business day (weekday and not holiday)
export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay()
  // Weekend check
  if (dayOfWeek === 0 || dayOfWeek === 6) return false
  // Holiday check
  if (isJapaneseHoliday(date)) return false
  return true
}

// Count business days (weekdays excluding holidays) in a month
export function getBusinessDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let businessDays = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    if (isBusinessDay(date)) {
      businessDays++
    }
  }

  return businessDays
}

// Helper to get daily prorated budget (business days only)
export function getDailyBudget(monthlyBudget: number, year: number, month: number): number {
  const businessDays = getBusinessDaysInMonth(year, month)
  if (businessDays === 0) return 0
  return Math.round(monthlyBudget / businessDays)
}

// Flattened order type for display
export interface FlattenedOrder {
  id: string
  orderName: string
  totalPayment: number
  hours: number
  hourlyRate: number
  personInCharge: string
  dueDate: string
  proposer: string
  jobScope: string
  jobLevel: string
  orderCategories: string[]
  createdAt: string
}

// Transform NotionOrder to FlattenedOrder
export function flattenOrder(order: NotionOrder): FlattenedOrder {
  const props = order.properties
  return {
    id: order.id,
    orderName: props.発注決裁名 ?? "-",
    totalPayment: props.総支給額 ?? 0,
    hours: props["時間/数量"] ?? 0,
    hourlyRate: props["時給/数量単価"] ?? 0,
    personInCharge: props.MB担当者名 ?? "-",
    dueDate: props["納期/シフト"] ?? "-",
    proposer: props.起案者 ?? "-",
    jobScope: props.職務範囲 ?? "-",
    jobLevel: props.業務レベル ?? "-",
    orderCategories: props["発注科目/依頼業務"] ?? [],
    createdAt: order.notion_created_at,
  }
}
