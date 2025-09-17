"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Download } from "lucide-react"
import type { Expense } from "@/lib/types"

interface AddExpenseFormProps {
  onAddExpense: (expense: Expense) => void
}

const categoryEmojis = {
  Food: "🍔",
  Groceries: "🛒",
  Medicines: "💊",
  Bills: "📄",
  Other: "📦",
}

export function AddExpenseForm({ onAddExpense }: AddExpenseFormProps) {
  const [category, setCategory] = useState<Expense["category"] | "">("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select an image (JPEG, PNG, WebP) or PDF file.",
          variant: "destructive",
        })
        return
      }

      setReceiptFile(file)
    }
  }

  const exportToPDF = () => {
    if (!category || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in category and amount before exporting.",
        variant: "destructive",
      })
      return
    }

    // Create a simple text-based PDF content
    const pdfContent = `
EXPENSE REPORT
==============

Category: ${category}
Amount: ₹${amount}
Date: ${date}
Description: ${description || "N/A"}
Receipt: ${receiptFile ? receiptFile.name : "No receipt attached"}

Generated on: ${new Date().toLocaleString()}
    `.trim()

    // Create and download the file
    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expense-${category}-${date}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Expense data has been exported as a text file.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    let receiptUrl = ""
    let receiptName = ""

    if (receiptFile) {
      // In a real app, you would upload to a cloud storage service
      // For demo purposes, we'll create a local URL
      receiptUrl = URL.createObjectURL(receiptFile)
      receiptName = receiptFile.name
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: category as Expense["category"],
      amount: Number.parseFloat(amount),
      date,
      description: description || undefined,
      receiptUrl: receiptUrl || undefined,
      receiptName: receiptName || undefined,
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    onAddExpense(expense)

    // Reset form
    setCategory("")
    setAmount("")
    setDate(new Date().toISOString().split("T")[0])
    setDescription("")
    setReceiptFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsLoading(false)

    toast({
      title: "Expense Added! 💸",
      description: `₹${amount} expense for ${category} has been recorded.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">💸 Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Expense["category"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryEmojis).map(([cat, emoji]) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        {emoji} {cat}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note about this expense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt Attachment (Optional)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {receiptFile ? "Change Receipt" : "Attach Receipt"}
              </Button>
              {receiptFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {receiptFile.name}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Supported formats: JPEG, PNG, WebP, PDF (max 5MB)</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Adding Expense..." : "Add Expense 💰"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
