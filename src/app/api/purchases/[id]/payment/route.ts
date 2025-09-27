import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { paymentMethod, amount, clientName, clientCpf, pixCode } = await request.json()

    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: {
        raffle: true
      }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: "Compra não encontrada" },
        { status: 404 }
      )
    }

    // Check if user owns this purchase
    if (purchase.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      )
    }

    if (purchase.status !== "PENDING") {
      return NextResponse.json(
        { error: "Compra já foi processada" },
        { status: 400 }
      )
    }

    // Simulate payment processing
    // In a real application, you would integrate with a payment provider like Stripe, PayPal, etc.
    const paymentSuccess = Math.random() > 0.1 // 90% success rate for demo

    if (!paymentSuccess) {
      return NextResponse.json(
        { error: "Pagamento falhou. Tente novamente." },
        { status: 400 }
      )
    }

    // Update purchase status
    const updatedPurchase = await prisma.purchase.update({
      where: { id: params.id },
      data: {
        status: "PENDING",
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientName,
        clientCpf,
        pixCode
      },
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      }
    })

    const formattedPurchase = {
      id: updatedPurchase.id,
      numbers: JSON.parse(updatedPurchase.numbers),
      total: updatedPurchase.total,
      status: updatedPurchase.status,
      createdAt: updatedPurchase.createdAt,
      raffle: updatedPurchase.raffle
    }

    return NextResponse.json({ purchase: formattedPurchase })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}