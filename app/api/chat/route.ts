import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    const contextSummary = `
User's Financial Data:
- Total Income: ₹${context.totalIncome}
- Total Expenses: ₹${context.totalExpenses}
- Monthly Income: ₹${context.monthlyIncome}
- Monthly Expenses: ₹${context.monthlyExpenses}
- Net Worth: ₹${context.netWorth}
- Active Goals: ${context.activeGoals}
- Active Reminders: ${context.activeReminders}
- Top Expense Categories: ${Object.entries(context.expensesByCategory)
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(", ")}

Please provide helpful financial advice based on this data and the user's question: "${message}"
Keep responses concise, practical, and encouraging. Use Indian Rupee (₹) currency format.
`

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      system:
        "You are a helpful financial advisor AI assistant. Provide practical, encouraging financial advice in a friendly tone.",
      prompt: contextSummary,
      maxTokens: 500,
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat API Error:", error)

    const fallbackResponses = [
      "I'd be happy to help with your financial planning! Based on your data, consider reviewing your expense categories to identify potential savings.",
      "Great question! It's important to maintain a balanced budget. Try setting aside 20% of your income for savings and investments.",
      "Financial planning is key to success! Consider creating an emergency fund covering 3-6 months of expenses.",
      "Smart financial management starts with tracking expenses. Your current data shows good financial awareness!",
    ]

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    return NextResponse.json({ response: randomResponse })
  }
}
