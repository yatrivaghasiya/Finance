"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Send, Loader2, TrendingUp, DollarSign, Target, Calendar } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Expense, Income, Goal, Reminder } from "@/lib/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  expenses: Expense[]
  incomes: Income[]
  goals: Goal[]
  reminders: Reminder[]
}

export function AIChatbot({ expenses, incomes, goals, reminders }: AIChatbotProps) {
  const [messages, setMessages] = useLocalStorage<Message[]>("financeApp_chatMessages", [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getFinancialContext = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
    const activeGoals = goals.filter((goal) => goal.currentAmount < goal.targetAmount)
    const activeReminders = reminders.filter((reminder) => !reminder.completed)

    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthlyExpenses = expenses
      .filter((expense) => expense.date.startsWith(currentMonth))
      .reduce((sum, expense) => sum + expense.amount, 0)

    const monthlyIncome = incomes
      .filter((income) => income.date.startsWith(currentMonth))
      .reduce((sum, income) => sum + income.amount, 0)

    const expensesByCategory = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalExpenses,
      totalIncome,
      monthlyExpenses,
      monthlyIncome,
      netWorth: totalIncome - totalExpenses,
      activeGoals: activeGoals.length,
      activeReminders: activeReminders.length,
      expensesByCategory,
      recentExpenses: expenses.slice(-5),
      upcomingGoalDeadlines: activeGoals.filter((goal) => {
        const deadline = new Date(goal.deadline)
        const now = new Date()
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDeadline <= 30 && daysUntilDeadline > 0
      }),
    }
  }

  const generateFinancialAdvice = async (userMessage: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: getFinancialContext(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("AI Chat Error:", error)
      // Fallback to local financial advice if API fails
      return generateLocalFinancialAdvice(userMessage)
    }
  }

  const generateLocalFinancialAdvice = async (userMessage: string) => {
    const context = getFinancialContext()

    // Simulate AI response based on financial context
    let response = ""

    if (userMessage.toLowerCase().includes("budget") || userMessage.toLowerCase().includes("spending")) {
      if (context.monthlyExpenses > context.monthlyIncome) {
        response = `I notice you're spending ₹${context.monthlyExpenses.toFixed(2)} this month but only earned ₹${context.monthlyIncome.toFixed(2)}. You're overspending by ₹${(context.monthlyExpenses - context.monthlyIncome).toFixed(2)}. 

Here are some suggestions:
• Review your ${Object.entries(context.expensesByCategory).sort(([, a], [, b]) => b - a)[0][0]} expenses (₹${Object.entries(
          context.expensesByCategory,
        )
          .sort(([, a], [, b]) => b - a)[0][1]
          .toFixed(2)}) - this is your highest category
• Set a monthly budget limit for each category
• Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings`
      } else {
        response = `Great job! You're managing your budget well this month. You've spent ₹${context.monthlyExpenses.toFixed(2)} and earned ₹${context.monthlyIncome.toFixed(2)}, leaving you with ₹${(context.monthlyIncome - context.monthlyExpenses).toFixed(2)} surplus.

Consider:
• Investing the surplus in your goals
• Building an emergency fund (3-6 months of expenses)
• Reviewing if you can optimize any expense categories`
      }
    } else if (userMessage.toLowerCase().includes("goal") || userMessage.toLowerCase().includes("save")) {
      if (context.activeGoals > 0) {
        response = `You have ${context.activeGoals} active savings goals. ${context.upcomingGoalDeadlines.length > 0 ? `${context.upcomingGoalDeadlines.length} goals have deadlines within 30 days.` : ""}

Tips for achieving your goals:
• Automate savings - set up automatic transfers
• Use the surplus from your budget (₹${Math.max(0, context.monthlyIncome - context.monthlyExpenses).toFixed(2)}) toward goals
• Consider the "pay yourself first" principle
• Break large goals into smaller milestones`
      } else {
        response = `I don't see any active savings goals. Setting financial goals is crucial for building wealth! 

Consider setting goals for:
• Emergency fund (3-6 months of expenses: ₹${(context.monthlyExpenses * 3).toFixed(2)} - ₹${(context.monthlyExpenses * 6).toFixed(2)})
• Vacation or major purchase
• Retirement savings
• Investment portfolio`
      }
    } else if (userMessage.toLowerCase().includes("expense") || userMessage.toLowerCase().includes("cost")) {
      const topCategory = Object.entries(context.expensesByCategory).sort(([, a], [, b]) => b - a)[0]
      response = `Your expense analysis:

Total expenses: ₹${context.totalExpenses.toFixed(2)}
This month: ₹${context.monthlyExpenses.toFixed(2)}
Top category: ${topCategory[0]} (₹${topCategory[1].toFixed(2)})

Recent expense trends:
${context.recentExpenses.map((expense) => `• ${expense.category}: ₹${expense.amount.toFixed(2)} - ${expense.description || "No description"}`).join("\n")}

Consider tracking patterns and setting category-wise budgets to optimize spending.`
    } else if (userMessage.toLowerCase().includes("income") || userMessage.toLowerCase().includes("earn")) {
      response = `Your income overview:

Total income: ₹${context.totalIncome.toFixed(2)}
This month: ₹${context.monthlyIncome.toFixed(2)}
Net worth: ₹${context.netWorth.toFixed(2)}

${context.netWorth > 0 ? "Positive net worth - great job!" : "Consider increasing income or reducing expenses to improve your financial position."}

Ways to boost income:
• Freelancing or side hustles
• Skill development for promotions
• Passive income streams
• Investment returns`
    } else {
      response = `I'm your AI financial assistant! I can help you with:

📊 **Budget Analysis** - Ask about your spending patterns
💰 **Income Optimization** - Discuss ways to increase earnings  
🎯 **Goal Planning** - Set and track financial objectives
💸 **Expense Management** - Analyze and optimize spending
📈 **Financial Health** - Overall financial wellness tips

Your current snapshot:
• Total Income: ₹${context.totalIncome.toFixed(2)}
• Total Expenses: ₹${context.totalExpenses.toFixed(2)}
• Net Position: ₹${context.netWorth.toFixed(2)}
• Active Goals: ${context.activeGoals}
• Pending Reminders: ${context.activeReminders}

What would you like to discuss about your finances?`
    }

    return response
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      const aiResponse = await generateFinancialAdvice(userMessage.content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const quickQuestions = [
    "How is my budget this month?",
    "What are my biggest expenses?",
    "How can I save more money?",
    "Am I on track with my goals?",
    "Give me financial advice",
  ]

  const context = getFinancialContext()

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-700">₹{context.netWorth.toFixed(2)}</div>
                <div className="text-xs text-green-600">Net Worth</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-700">₹{context.monthlyIncome.toFixed(2)}</div>
                <div className="text-xs text-blue-600">This Month Income</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-lg font-bold text-orange-700">₹{context.monthlyExpenses.toFixed(2)}</div>
                <div className="text-xs text-orange-600">This Month Expenses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-lg font-bold text-purple-700">{context.activeGoals}</div>
                <div className="text-xs text-purple-600">Active Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Financial Assistant
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Questions */}
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Quick questions to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Chat Messages */}
          <ScrollArea className="h-96 w-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0 order-2">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your finances..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            💡 Ask about budgets, expenses, savings goals, or general financial advice
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
