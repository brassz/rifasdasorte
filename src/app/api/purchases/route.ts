import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { raffleId, numbers } = await request.json()

    // Verify raffle exists and is active
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        numbers: {
          where: {
            number: { in: numbers }
          }
        }
      }
    })

    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa não encontrada" },
        { status: 404 }
      )
    }

    if (raffle.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Rifa não está ativa" },
        { status: 400 }
      )
    }

    // Check if any numbers are already sold
    const soldNumbers = raffle.numbers.filter(n => n.isSold)
    if (soldNumbers.length > 0) {
      return NextResponse.json(
        { error: `Números ${soldNumbers.map(n => n.number).join(", ")} já foram vendidos` },
        { status: 400 }
      )
    }

    // Calculate total
    const total = numbers.length * raffle.pricePerNumber

    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        numbers: JSON.stringify(numbers),
        total,
        status: "PENDING",
        userId: session.user.id,
        raffleId
      }
    })

    // Mark numbers as sold
    await prisma.raffleNumber.updateMany({
      where: {
        raffleId,
        number: { in: numbers }
      },
      data: {
        isSold: true
      }
    })

    return NextResponse.json({ purchase })
  } catch (error) {
    console.error("Error creating purchase:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}