export interface Expense {
  id: string
  category: "Food" | "Groceries" | "Medicines" | "Bills" | "Other"
  amount: number
  date: string
  description?: string
  receiptUrl?: string
  receiptName?: string
}

export interface Reminder {
  id: string
  text: string
  date: string
  completed: boolean
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

export interface Income {
  id: string
  source: "Salary" | "Freelance" | "Business" | "Investment" | "Other"
  amount: number
  date: string
  description?: string
  isRecurring: boolean
  frequency?: "Weekly" | "Monthly" | "Quarterly" | "Yearly"
}
