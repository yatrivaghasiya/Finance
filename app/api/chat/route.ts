import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    // Create a financial context summary for ChatGPT
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful financial advisor AI assistant. Provide practical, encouraging financial advice in a friendly tone.",
          },
          {
            role: "user",
            content: contextSummary,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error("OpenAI API request failed")
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content || "I apologize, but I cannot provide a response at this time."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
