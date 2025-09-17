"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useMobile } from "@/hooks/use-mobile"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { AddExpenseForm } from "./add-expense-form"
import { RecentExpenses } from "./recent-expenses"
import { ExpenseSummary } from "./expense-summary"
import { RemindersManager } from "./reminders-manager"
import { GoalsManager } from "./goals-manager"
import { IncomeManager } from "./income-manager"
import { SettingsManager } from "./settings-manager"
import { AIChatbot } from "./ai-chatbot"
import type { Expense, Reminder, Goal, Income } from "@/lib/types"

type ActiveSection = "home" | "expenses" | "summary" | "reminders" | "goals" | "income" | "settings" | "chatbot"

export function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("home")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()
  const isMobile = useMobile()

  const [expenses, setExpenses] = useLocalStorage<Expense[]>("financeApp_expenses", [])
  const [reminders, setReminders] = useLocalStorage<Reminder[]>("financeApp_reminders", [])
  const [goals, setGoals] = useLocalStorage<Goal[]>("financeApp_goals", [])
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>("financeApp_monthlyIncome", 0)
  const [incomes, setIncomes] = useLocalStorage<Income[]>("financeApp_incomes", [])

  const menuItems = [
    { id: "home" as const, label: "Home", icon: "🏠" },
    { id: "expenses" as const, label: "Add Expense", icon: "💸" },
    { id: "summary" as const, label: "View Summary", icon: "📊" },
    { id: "reminders" as const, label: "Reminders", icon: "⏰" },
    { id: "goals" as const, label: "Goals", icon: "🎯" },
    { id: "income" as const, label: "Income", icon: "💰" },
    { id: "chatbot" as const, label: "AI Assistant", icon: "🤖" },
    { id: "settings" as const, label: "Settings", icon: "⚙️" },
  ]

  const handleMenuClick = (sectionId: ActiveSection) => {
    setActiveSection(sectionId)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleCardClick = (sectionId: ActiveSection) => {
    setActiveSection(sectionId)
  }

  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [...prev, expense])
  }

  const handleAddReminder = (reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder])
  }

  const handleUpdateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders((prev) => prev.map((reminder) => (reminder.id === id ? { ...reminder, ...updates } : reminder)))
  }

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
  }

  const handleAddGoal = (goal: Goal) => {
    setGoals((prev) => [...prev, goal])
  }

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)))
  }

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id))
  }

  const handleAddIncome = (income: Income) => {
    setIncomes((prev) => [...prev, income])
  }

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((income) => income.id !== id))
  }

  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  const weeklySpending = expenses
    .filter((expense) => new Date(expense.date) >= lastWeek)
    .reduce((sum, expense) => sum + expense.amount, 0)

  const monthlySpending = expenses
    .filter((expense) => new Date(expense.date) >= lastMonth)
    .reduce((sum, expense) => sum + expense.amount, 0)

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const activeRemindersCount = reminders.filter((r) => !r.completed).length
  const goalsCount = goals.length
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  const SidebarContent = () => (
    <nav className="space-y-2 p-4">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeSection === item.id ? "default" : "ghost"}
          className="w-full justify-start gap-3 text-left"
          onClick={() => handleMenuClick(item.id)}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Button>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold text-primary">💸 Smart Finance AI</h2>
                  </div>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}
            <h1 className={`font-bold text-primary ${isMobile ? "text-lg" : "text-2xl"}`}>
              {isMobile ? "💸 Smart Finance AI" : "💸 Smart Finance AI – Your Companion Guide & Maintenance Bot"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.name}!</span>
            <Button variant="outline" onClick={logout} size="sm">
              {isMobile ? "🚪" : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {!isMobile && (
          <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-[calc(100vh-73px)] transition-colors duration-200">
            <SidebarContent />
          </aside>
        )}

        <main className="flex-1 p-4 md:p-6 transition-colors duration-200">
          {activeSection === "home" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">🏠 Home Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Welcome to Smart Finance AI! Use the {isMobile ? "menu" : "sidebar"} to navigate between different
                    sections:
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card
                      className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCardClick("expenses")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💸</span>
                          <div>
                            <h3 className="font-semibold">Add Expense</h3>
                            <p className="text-sm text-muted-foreground">Track your daily expenses</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCardClick("summary")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📊</span>
                          <div>
                            <h3 className="font-semibold">View Summary</h3>
                            <p className="text-sm text-muted-foreground">See your spending patterns</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCardClick("reminders")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⏰</span>
                          <div>
                            <h3 className="font-semibold">Reminders</h3>
                            <p className="text-sm text-muted-foreground">Set financial reminders</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCardClick("goals")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎯</span>
                          <div>
                            <h3 className="font-semibold">Goals</h3>
                            <p className="text-sm text-muted-foreground">Track your savings goals</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="bg-gradient-to-br from-chart-5/10 to-chart-5/5 border-chart-5/20 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCardClick("income")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💰</span>
                          <div>
                            <h3 className="font-semibold">Income</h3>
                            <p className="text-sm text-muted-foreground">Manage your monthly income</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="bg-gradient-to-br from-purple-100/50 to-purple-200/50 border-purple-200/50 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCardClick("chatbot")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🤖</span>
                          <div>
                            <h3 className="font-semibold">AI Assistant</h3>
                            <p className="text-sm text-muted-foreground">Get financial advice</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">₹{totalExpenses.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total Expenses</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">₹{weeklySpending.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Last Week</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">₹{monthlySpending.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Last Month</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">{activeRemindersCount}</div>
                      <div className="text-sm text-muted-foreground">Active Reminders</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total Income</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {expenses.length > 0 && <RecentExpenses expenses={expenses} />}
            </div>
          )}

          {activeSection === "expenses" && (
            <div className="space-y-6">
              <AddExpenseForm onAddExpense={handleAddExpense} />
              <RecentExpenses expenses={expenses} />
            </div>
          )}

          {activeSection === "summary" && <ExpenseSummary expenses={expenses} />}

          {activeSection === "reminders" && (
            <RemindersManager
              reminders={reminders}
              onAddReminder={handleAddReminder}
              onUpdateReminder={handleUpdateReminder}
              onDeleteReminder={handleDeleteReminder}
            />
          )}

          {activeSection === "goals" && (
            <GoalsManager
              goals={goals}
              expenses={expenses}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeSection === "income" && (
            <IncomeManager incomes={incomes} onAddIncome={handleAddIncome} onDeleteIncome={handleDeleteIncome} />
          )}

          {activeSection === "settings" && <SettingsManager />}

          {activeSection === "chatbot" && (
            <AIChatbot expenses={expenses} incomes={incomes} goals={goals} reminders={reminders} />
          )}
        </main>
      </div>
    </div>
  )
}
