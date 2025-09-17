"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Expense } from "@/lib/types"

interface RecentExpensesProps {
  expenses: Expense[]
}

const categoryEmojis = {
  Food: "🍔",
  Groceries: "🛒",
  Medicines: "💊",
  Bills: "📄",
  Other: "📦",
}

const categoryColors = {
  Food: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Groceries: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Medicines: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Bills: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Other: "bg-chart-5/10 text-chart-5 border-chart-5/20",
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recentExpenses = expenses.slice(-5).reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">📋 Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {recentExpenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No expenses added yet. Add your first expense above!</p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{categoryEmojis[expense.category]}</span>
                  <div>
                    <div className="font-medium">{expense.description || expense.category}</div>
                    <div className="text-sm text-muted-foreground">{expense.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={categoryColors[expense.category]}>
                    {expense.category}
                  </Badge>
                  <div className="font-bold text-lg">₹{expense.amount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
