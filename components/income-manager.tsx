"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, TrendingUp, Calendar, DollarSign } from "lucide-react"
import type { Income } from "@/lib/types"

interface IncomeManagerProps {
  incomes: Income[]
  onAddIncome: (income: Income) => void
  onDeleteIncome: (id: string) => void
}

export function IncomeManager({ incomes, onAddIncome, onDeleteIncome }: IncomeManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    source: "" as Income["source"],
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    isRecurring: false,
    frequency: "" as Income["frequency"],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.source || !formData.amount) {
      return
    }

    const newIncome: Income = {
      id: Date.now().toString(),
      source: formData.source,
      amount: Number.parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      isRecurring: formData.isRecurring,
      frequency: formData.isRecurring ? formData.frequency : undefined,
    }

    onAddIncome(newIncome)
    setFormData({
      source: "" as Income["source"],
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      isRecurring: false,
      frequency: "" as Income["frequency"],
    })
    setShowForm(false)
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const monthlyRecurringIncome = incomes
    .filter((income) => income.isRecurring && income.frequency === "Monthly")
    .reduce((sum, income) => sum + income.amount, 0)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const thisMonthIncome = incomes
    .filter((income) => income.date.startsWith(currentMonth))
    .reduce((sum, income) => sum + income.amount, 0)

  const getSourceIcon = (source: Income["source"]) => {
    switch (source) {
      case "Salary":
        return "💼"
      case "Freelance":
        return "💻"
      case "Business":
        return "🏢"
      case "Investment":
        return "📈"
      case "Other":
        return "💰"
      default:
        return "💰"
    }
  }

  const getFrequencyColor = (frequency?: Income["frequency"]) => {
    switch (frequency) {
      case "Weekly":
        return "bg-green-100 text-green-800"
      case "Monthly":
        return "bg-blue-100 text-blue-800"
      case "Quarterly":
        return "bg-purple-100 text-purple-800"
      case "Yearly":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Income Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">₹{totalIncome.toFixed(2)}</div>
              <div className="text-sm text-green-600">Total Income</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">₹{thisMonthIncome.toFixed(2)}</div>
              <div className="text-sm text-blue-600">This Month</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">₹{monthlyRecurringIncome.toFixed(2)}</div>
              <div className="text-sm text-purple-600">Monthly Recurring</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">💰 Income Management</CardTitle>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Income
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="source">Income Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, source: value as Income["source"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salary">💼 Salary</SelectItem>
                      <SelectItem value="Freelance">💻 Freelance</SelectItem>
                      <SelectItem value="Business">🏢 Business</SelectItem>
                      <SelectItem value="Investment">📈 Investment</SelectItem>
                      <SelectItem value="Other">💰 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Monthly salary, Project payment"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isRecurring: checked as boolean }))}
                />
                <Label htmlFor="recurring">This is a recurring income</Label>
              </div>

              {formData.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, frequency: value as Income["frequency"] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">Add Income</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {incomes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No income entries yet. Add your first income source!</p>
              </div>
            ) : (
              incomes
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((income) => (
                  <Card key={income.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSourceIcon(income.source)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{income.source}</span>
                            {income.isRecurring && (
                              <Badge className={getFrequencyColor(income.frequency)}>{income.frequency}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(income.date).toLocaleDateString()}
                            {income.description && ` • ${income.description}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-green-600">+₹{income.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteIncome(income.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
