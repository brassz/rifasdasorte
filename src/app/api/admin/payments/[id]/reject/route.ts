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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: "Compra não encontrada" },
        { status: 404 }
      )
    }

    if (purchase.status !== "PENDING") {
      return NextResponse.json(
        { error: "Pagamento já foi processado" },
        { status: 400 }
      )
    }

    // Update purchase status to CANCELLED
    const updatedPurchase = await prisma.purchase.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED"
      }
    })

    return NextResponse.json({ purchase: updatedPurchase })
  } catch (error) {
    console.error("Error rejecting payment:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}