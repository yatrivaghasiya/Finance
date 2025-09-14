"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"
import { Calendar, Filter, TrendingUp, Award } from "lucide-react"
import type { Expense } from "@/lib/types"

interface ExpenseSummaryProps {
  expenses: Expense[]
}

const categoryEmojis = {
  Food: "🍔",
  Groceries: "🛒",
  Medicines: "💊",
  Bills: "📄",
  Other: "📦",
}

const COLORS = {
  Food: "#f59e0b", // amber-500
  Groceries: "#10b981", // emerald-500
  Medicines: "#ef4444", // red-500
  Bills: "#3b82f6", // blue-500
  Other: "#8b5cf6", // violet-500
}

const BAR_COLORS = {
  Food: "#fbbf24", // amber-400
  Groceries: "#34d399", // emerald-400
  Medicines: "#f87171", // red-400
  Bills: "#60a5fa", // blue-400
  Other: "#a78bfa", // violet-400
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredExpenses = expenses.filter((expense) => {
    if (!dateFilter.startDate && !dateFilter.endDate) return true

    const expenseDate = new Date(expense.date)
    const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null
    const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null

    if (start && expenseDate < start) return false
    if (end && expenseDate > end) return false

    return true
  })

  const clearFilters = () => {
    setDateFilter({ startDate: "", endDate: "" })
  }

  // Calculate category totals
  const categoryTotals = filteredExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount], index) => ({
      category,
      amount,
      emoji: categoryEmojis[category as keyof typeof categoryEmojis],
      rank: index + 1,
      percentage: ((amount / Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)) * 100).toFixed(1),
    }))

  // Prepare data for charts
  const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
    emoji: categoryEmojis[category as keyof typeof categoryEmojis],
    color: COLORS[category as keyof typeof COLORS],
  }))

  const barData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    emoji: categoryEmojis[category as keyof typeof categoryEmojis],
  }))

  const monthlyData = filteredExpenses.reduce(
    (acc, expense) => {
      const month = expense.date.substring(0, 7) // YYYY-MM format
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyChartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount], index, array) => {
      const prevAmount = index > 0 ? array[index - 1][1] : 0
      const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0

      return {
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        amount,
        change: change.toFixed(1),
        isIncrease: change > 0,
      }
    })

  const dailyData = filteredExpenses.reduce(
    (acc, expense) => {
      acc[expense.date] = (acc[expense.date] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const lineChartData = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount,
      fullDate: date,
    }))

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">📊 Expense Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No Expenses Yet</h3>
            <p className="text-muted-foreground">Add some expenses to see your spending summary and charts!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">📊 Expense Summary</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="pt-0">
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">₹{totalExpenses.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{filteredExpenses.length}</div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                ₹{filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(2) : "0.00"}
              </div>
              <div className="text-sm text-muted-foreground">Avg per Transaction</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-1">{Object.keys(categoryTotals).length}</div>
              <div className="text-sm text-muted-foreground">Categories Used</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top 3 Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {topCategories.map((category) => (
                <div key={category.category} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">{category.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{category.rank}</span>
                      <span>{category.category}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ₹{category.amount.toFixed(2)} ({category.percentage}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🥧 Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📊 Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${categoryEmojis[value as keyof typeof categoryEmojis]} ${value}`}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, "Amount"]} />
                  <Bar
                    dataKey="amount"
                    radius={[4, 4, 0, 0]}
                    fill={(entry: any) => BAR_COLORS[entry.category as keyof typeof BAR_COLORS] || "#0891b2"}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[entry.category as keyof typeof BAR_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {lineChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, "Amount"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {monthlyChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📈 Monthly Spending Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "amount") return [`₹${value.toFixed(2)}`, "Amount"]
                      return [value, name]
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {monthlyChartData.slice(-3).map((month, index) => (
                <div key={month.month} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">₹{month.amount.toFixed(2)}</span>
                    {index > 0 && (
                      <span
                        className={`text-xs px-1 py-0.5 rounded ${
                          month.isIncrease ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {month.isIncrease ? "+" : ""}
                        {month.change}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📋 All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{categoryEmojis[expense.category]}</span>
                    <div>
                      <div className="font-medium">{expense.description || expense.category}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {expense.date}
                        {expense.receiptName && (
                          <Badge variant="outline" className="text-xs">
                            📎 Receipt
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${COLORS[expense.category]}20`,
                        borderColor: `${COLORS[expense.category]}40`,
                        color: COLORS[expense.category],
                      }}
                    >
                      {expense.category}
                    </Badge>
                    <div className="font-bold text-lg">₹{expense.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
