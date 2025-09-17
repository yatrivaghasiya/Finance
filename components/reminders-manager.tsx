"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Calendar } from "lucide-react"
import type { Reminder } from "@/lib/types"

interface RemindersManagerProps {
  reminders: Reminder[]
  onAddReminder: (reminder: Reminder) => void
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => void
  onDeleteReminder: (id: string) => void
}

export function RemindersManager({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
}: RemindersManagerProps) {
  const [text, setText] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in both reminder text and date.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const reminder: Reminder = {
      id: Date.now().toString(),
      text: text.trim(),
      date,
      completed: false,
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    onAddReminder(reminder)

    // Reset form
    setText("")
    setDate("")
    setIsLoading(false)

    toast({
      title: "Reminder Added! ⏰",
      description: `Reminder set for ${new Date(date).toLocaleDateString()}`,
    })
  }

  const handleToggleComplete = (id: string, completed: boolean) => {
    onUpdateReminder(id, { completed })
    toast({
      title: completed ? "Reminder Completed! ✅" : "Reminder Reopened",
      description: completed ? "Great job staying on track!" : "Reminder marked as pending",
    })
  }

  const handleDelete = (id: string) => {
    onDeleteReminder(id)
    toast({
      title: "Reminder Deleted",
      description: "Reminder has been removed from your list",
    })
  }

  // Sort reminders: incomplete first, then by date
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Get upcoming reminders (next 7 days)
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingReminders = reminders.filter(
    (r) => !r.completed && new Date(r.date) >= today && new Date(r.date) <= nextWeek,
  )

  // Get overdue reminders
  const overdueReminders = reminders.filter((r) => !r.completed && new Date(r.date) < today)

  const getDateStatus = (dateStr: string, completed: boolean) => {
    const reminderDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    reminderDate.setHours(0, 0, 0, 0)

    if (completed) return "completed"
    if (reminderDate < today) return "overdue"
    if (reminderDate.getTime() === today.getTime()) return "today"
    if (reminderDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) return "upcoming"
    return "future"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
            ✅ Completed
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            ⚠️ Overdue
          </Badge>
        )
      case "today":
        return (
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
            📅 Today
          </Badge>
        )
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
            🔜 Upcoming
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            📆 Future
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">⏰ Add New Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminderText">Reminder Text *</Label>
              <Textarea
                id="reminderText"
                placeholder="e.g., Pay EMI ₹2000, Submit tax documents, Review insurance policy..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderDate">Due Date *</Label>
              <Input
                id="reminderDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding Reminder..." : "Add Reminder ⏰"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reminders.filter((r) => !r.completed).length}</div>
              <div className="text-sm text-muted-foreground">Active Reminders</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{overdueReminders.length}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-1">{upcomingReminders.length}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-2">{reminders.filter((r) => r.completed).length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📋 All Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-lg font-semibold mb-2">No Reminders Yet</h3>
              <p className="text-muted-foreground">Add your first financial reminder above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedReminders.map((reminder) => {
                const status = getDateStatus(reminder.date, reminder.completed)
                return (
                  <div
                    key={reminder.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      reminder.completed ? "bg-muted/30" : "bg-card"
                    }`}
                  >
                    <Checkbox
                      checked={reminder.completed}
                      onCheckedChange={(checked) => handleToggleComplete(reminder.id, checked as boolean)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${reminder.completed ? "line-through text-muted-foreground" : ""}`}>
                        {reminder.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(reminder.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {getStatusBadge(status)}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reminder.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
