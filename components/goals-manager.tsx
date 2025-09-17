"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Target, Calendar } from "lucide-react"
import type { Goal, Expense } from "@/lib/types"

interface GoalsManagerProps {
  goals: Goal[]
  expenses: Expense[]
  onAddGoal: (goal: Goal) => void
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void
  onDeleteGoal: (id: string) => void
}

export function GoalsManager({ goals, expenses, onAddGoal, onUpdateGoal, onDeleteGoal }: GoalsManagerProps) {
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !targetAmount || !deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    const target = Number.parseFloat(targetAmount)
    if (target <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Target amount must be greater than 0.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const goal: Goal = {
      id: Date.now().toString(),
      name: name.trim(),
      targetAmount: target,
      currentAmount: 0,
      deadline,
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    onAddGoal(goal)

    // Reset form
    setName("")
    setTargetAmount("")
    setDeadline("")
    setIsLoading(false)

    toast({
      title: "Goal Created! 🎯",
      description: `Savings goal "${name}" has been set for ₹${target}`,
    })
  }

  const handleAddToGoal = (goalId: string, amount: number) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    onUpdateGoal(goalId, { currentAmount: newAmount })

    toast({
      title: "Progress Updated! 💰",
      description: `Added ₹${amount} to "${goal.name}"`,
    })
  }

  const handleDelete = (id: string, name: string) => {
    onDeleteGoal(id)
    toast({
      title: "Goal Deleted",
      description: `"${name}" has been removed from your goals`,
    })
  }

  // Calculate total expenses (money that's NOT available for savings)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate goal statistics
  const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalGoalProgress = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const completedGoals = goals.filter((goal) => goal.currentAmount >= goal.targetAmount).length

  const getGoalStatus = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const daysUntilDeadline = Math.ceil(
      (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )

    if (progress >= 100) return { status: "completed", color: "chart-2", message: "🎉 Goal Achieved!" }
    if (daysUntilDeadline < 0) return { status: "overdue", color: "destructive", message: "⚠️ Deadline Passed" }
    if (daysUntilDeadline <= 7) return { status: "urgent", color: "chart-1", message: "🔥 Deadline Soon" }
    if (progress >= 75) return { status: "on-track", color: "chart-4", message: "📈 On Track" }
    if (progress >= 50) return { status: "progress", color: "chart-3", message: "🚀 Making Progress" }
    return { status: "behind", color: "chart-5", message: "💪 Keep Going" }
  }

  const getFeedback = (totalSpent: number, totalSaved: number) => {
    const spendingRatio = totalSaved > 0 ? totalSpent / totalSaved : 0

    if (totalSaved === 0 && totalSpent === 0) {
      return { message: "Start tracking your expenses and set your first savings goal!", type: "neutral" }
    }

    if (totalSaved === 0) {
      return { message: "You're spending but not saving. Consider setting a savings goal!", type: "warning" }
    }

    if (spendingRatio < 2) {
      return { message: "Excellent! You're saving more than you're spending. Keep it up! 🌟", type: "success" }
    } else if (spendingRatio < 4) {
      return { message: "Good balance! You're on track with your savings goals. 👍", type: "good" }
    } else if (spendingRatio < 8) {
      return { message: "Consider reducing expenses to meet your savings goals faster. 💡", type: "caution" }
    } else {
      return { message: "You're overspending! Focus on cutting expenses to reach your goals. ⚠️", type: "warning" }
    }
  }

  const feedback = getFeedback(totalExpenses, totalGoalProgress)

  const handleManualAmountAdd = (goalId: string) => {
    const amountStr = manualAmounts[goalId]
    if (!amountStr || !amountStr.trim()) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive number.",
        variant: "destructive",
      })
      return
    }

    handleAddToGoal(goalId, amount)
    setManualAmounts((prev) => ({ ...prev, [goalId]: "" }))
  }

  return (
    <div className="space-y-6">
      {/* Add New Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">🎯 Set New Savings Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name *</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Emergency Fund, Vacation, New Laptop..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount (₹) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date *</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Goal..." : "Create Goal 🎯"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">💰 Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-chart-1/10 rounded-lg">
              <div className="text-2xl font-bold text-chart-1">₹{totalExpenses.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-chart-2/10 rounded-lg">
              <div className="text-2xl font-bold text-chart-2">₹{totalGoalProgress.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </div>
            <div className="text-center p-4 bg-chart-4/10 rounded-lg">
              <div className="text-2xl font-bold text-chart-4">₹{totalGoalTarget.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Goal Target</div>
            </div>
            <div className="text-center p-4 bg-chart-3/10 rounded-lg">
              <div className="text-2xl font-bold text-chart-3">{completedGoals}</div>
              <div className="text-sm text-muted-foreground">Goals Achieved</div>
            </div>
          </div>

          <div
            className={`mt-4 p-4 rounded-lg ${
              feedback.type === "success"
                ? "bg-chart-2/10 border border-chart-2/20"
                : feedback.type === "good"
                  ? "bg-chart-4/10 border border-chart-4/20"
                  : feedback.type === "caution"
                    ? "bg-chart-1/10 border border-chart-1/20"
                    : feedback.type === "warning"
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="font-medium">Financial Health Check:</span>
            </div>
            <p className="mt-1 text-sm">{feedback.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🎯 Your Savings Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">No Goals Set Yet</h3>
              <p className="text-muted-foreground">
                Create your first savings goal above to start tracking your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                const remaining = goal.targetAmount - goal.currentAmount
                const daysUntilDeadline = Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                const status = getGoalStatus(goal)

                return (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Target:{" "}
                            {new Date(goal.deadline).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>
                            (
                            {daysUntilDeadline > 0
                              ? `${daysUntilDeadline} days left`
                              : `${Math.abs(daysUntilDeadline)} days overdue`}
                            )
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`bg-${status.color}/10 text-${status.color} border-${status.color}/20`}
                        >
                          {status.message}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(goal.id, goal.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          Progress: ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                        </span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      {remaining > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ₹{remaining.toFixed(2)} remaining to reach your goal
                        </p>
                      )}
                    </div>

                    {progress < 100 && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleAddToGoal(goal.id, 100)}>
                            +₹100
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAddToGoal(goal.id, 500)}>
                            +₹500
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAddToGoal(goal.id, 1000)}>
                            +₹1000
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToGoal(goal.id, remaining)}
                            disabled={remaining <= 0}
                          >
                            Complete Goal
                          </Button>
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label htmlFor={`manual-${goal.id}`} className="text-sm">
                              Add Custom Amount
                            </Label>
                            <Input
                              id={`manual-${goal.id}`}
                              type="number"
                              placeholder="Enter amount..."
                              value={manualAmounts[goal.id] || ""}
                              onChange={(e) => setManualAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                              min="0.01"
                              step="0.01"
                              className="mt-1"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleManualAmountAdd(goal.id)}
                            disabled={!manualAmounts[goal.id]?.trim()}
                          >
                            Add Amount
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
