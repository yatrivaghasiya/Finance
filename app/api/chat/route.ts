import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    const fallbackResponses = [
      `Based on your financial data, I'd recommend focusing on your expense categories. With ₹${context.totalExpenses} in total expenses, consider identifying areas where you can optimize spending.`,
      `Great question! Your current net worth of ₹${context.netWorth} shows good financial management. Consider setting aside 20% of your ₹${context.monthlyIncome} monthly income for savings.`,
      `Financial planning is key to success! With ${context.activeGoals} active goals, you're on the right track. Consider creating an emergency fund covering 3-6 months of expenses.`,
      `Smart financial management starts with tracking expenses. Your monthly expenses of ₹${context.monthlyExpenses} show good financial awareness! Keep monitoring your spending patterns.`,
      `Excellent financial discipline! With your current income-to-expense ratio, you have room for investment. Consider diversifying your portfolio for long-term growth.`,
    ]

    const contextualResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

    return NextResponse.json({ response: contextualResponse })
  } catch (error) {
    console.error("Chat API Error:", error)

    return NextResponse.json({
      response: "I'm here to help with your financial planning! Please try asking your question again.",
    })
  }
}
