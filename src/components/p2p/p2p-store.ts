import type { P2POrderDB } from '@/types'

export interface P2PCalc {
  commissionFee: number
  netBs: number
  usdtSold: number
  totalUsdtBought: number
  totalBsSpent: number
  profit: number
}

/** For live calculation inside the form (camelCase) */
export interface P2PFormOperation {
  id: string
  bsSent: number
  usdtReceived: number
}

export function calcOrder(order: {
  baseAmount: number
  sellRate: number
  commissionPct: number
  operations: P2PFormOperation[]
}): P2PCalc {
  const commissionFee = order.baseAmount * (order.commissionPct / 100)
  const netBs = order.baseAmount - commissionFee
  const usdtSold = order.sellRate > 0 ? order.baseAmount / order.sellRate : 0
  const totalUsdtBought = order.operations.reduce((s, o) => s + o.usdtReceived, 0)
  const totalBsSpent = order.operations.reduce((s, o) => s + o.bsSent, 0)
  const profit = netBs - totalBsSpent
  return { commissionFee, netBs, usdtSold, totalUsdtBought, totalBsSpent, profit }
}

/** For displaying saved orders fetched from DB (snake_case) */
export function calcOrderDB(order: P2POrderDB): P2PCalc {
  const base = Number(order.base_amount)
  const commissionFee = base * (Number(order.commission_pct) / 100)
  const netBs = base - commissionFee
  const usdtSold = Number(order.sell_rate) > 0 ? base / Number(order.sell_rate) : 0
  const ops = order.p2p_operations ?? []
  const totalUsdtBought = ops.reduce((s, o) => s + Number(o.usdt_received), 0)
  const totalBsSpent = ops.reduce((s, o) => s + Number(o.bs_sent), 0)
  const profit = netBs - totalBsSpent
  return { commissionFee, netBs, usdtSold, totalUsdtBought, totalBsSpent, profit }
}
