export type Currency = 'USD' | 'EUR' | 'COP' | 'BRL' | 'PEN'

export type TransactionStatus = 'pending' | 'delivered'

export interface Client {
  id: string
  user_id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  client_id: string
  currency: Currency
  amount: number
  buy_rate: number
  market_rate: number
  profit: number
  status: TransactionStatus
  notes: string | null
  created_at: string
  delivered_at: string | null
  clients?: Client
}

export type ExpenseCategory =
  | 'comida'
  | 'transporte'
  | 'servicios'
  | 'entretenimiento'
  | 'salud'
  | 'otro'

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: ExpenseCategory
  description: string
  created_at: string
}

export interface DashboardStats {
  totalAmountDay: number
  totalAmountWeek: number
  totalAmountMonth: number
  totalProfitDay: number
  totalProfitWeek: number
  totalProfitMonth: number
  pendingCount: number
  pendingAmount: number
}
