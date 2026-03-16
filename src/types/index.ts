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

export interface Payment {
  id: string
  user_id: string
  transaction_id: string
  amount: number
  notes: string | null
  created_at: string
}

export interface P2POperationDB {
  id: string
  order_id: string
  bs_sent: number
  usdt_received: number
  created_at: string
}

export interface P2POrderDB {
  id: string
  user_id: string
  base_amount: number
  sell_rate: number
  commission_pct: number
  created_at: string
  p2p_operations?: P2POperationDB[]
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
