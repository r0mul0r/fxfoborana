export interface P2POperation {
  id: string
  usdt: number
  rate: number       // Bs/USDT buy rate on Binance
  commission: number // Bs commission for this operation
}

export interface P2POrder {
  id: string
  createdAt: string
  baseAmount: number    // Bs received from client
  sellRate: number      // Bs/USDT rate charged to client
  commissionPct: number // e.g. 0.3
  operations: P2POperation[]
}

export interface P2PCalc {
  commissionFee: number
  netBs: number
  usdtSold: number
  totalUsdtBought: number
  totalBsSpent: number
  profit: number
}

const KEY = 'p2p_orders'

export function getOrders(): P2POrder[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveOrder(order: P2POrder): void {
  const orders = getOrders()
  const idx = orders.findIndex((o) => o.id === order.id)
  if (idx >= 0) orders[idx] = order
  else orders.unshift(order)
  localStorage.setItem(KEY, JSON.stringify(orders))
}

export function deleteOrder(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getOrders().filter((o) => o.id !== id)))
}

export function calcOrder(order: Pick<P2POrder, 'baseAmount' | 'sellRate' | 'commissionPct' | 'operations'>): P2PCalc {
  const commissionFee = order.baseAmount * (order.commissionPct / 100)
  const netBs = order.baseAmount - commissionFee
  const usdtSold = order.sellRate > 0 ? order.baseAmount / order.sellRate : 0
  const totalUsdtBought = order.operations.reduce((s, o) => s + o.usdt, 0)
  const totalBsSpent = order.operations.reduce((s, o) => s + o.usdt * o.rate + o.commission, 0)
  const profit = netBs - totalBsSpent
  return { commissionFee, netBs, usdtSold, totalUsdtBought, totalBsSpent, profit }
}
