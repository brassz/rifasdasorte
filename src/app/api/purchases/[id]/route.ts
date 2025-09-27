import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
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

    if (!purchase) {
      return NextResponse.json(
        { error: "Compra não encontrada" },
        { status: 404 }
      )
    }

    // Check if user owns this purchase or is admin
    if (purchase.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      )
    }

    const formattedPurchase = {
      id: purchase.id,
      numbers: JSON.parse(purchase.numbers),
      total: purchase.total,
      status: purchase.status,
      createdAt: purchase.createdAt,
      raffle: purchase.raffle
    }

    return NextResponse.json({ purchase: formattedPurchase })
  } catch (error) {
    console.error("Error fetching purchase:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}