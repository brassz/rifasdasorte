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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true
      }
    })

    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa não encontrada" },
        { status: 404 }
      )
    }

    const payments = await prisma.purchase.findMany({
      where: {
        raffleId: params.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      numbers: JSON.parse(payment.numbers),
      total: payment.total,
      status: payment.status,
      clientName: payment.clientName,
      clientCpf: payment.clientCpf,
      pixCode: payment.pixCode,
      createdAt: payment.createdAt,
      user: payment.user
    }))

    return NextResponse.json({
      raffle,
      payments: formattedPayments
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}