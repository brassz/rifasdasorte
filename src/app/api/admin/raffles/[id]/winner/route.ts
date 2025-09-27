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
        description: true,
        totalNumbers: true,
        winnerNumber: true,
        winnerId: true,
        status: true,
        _count: {
          select: {
            numbers: {
              where: { isSold: true }
            }
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

    // Get all sold numbers with their purchasers
    const soldNumbers = await prisma.raffleNumber.findMany({
      where: {
        raffleId: params.id,
        isSold: true
      },
      include: {
        raffle: {
          include: {
            purchases: {
              where: {
                status: "PAID"
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Create winners list
    const winners = soldNumbers.map(soldNumber => {
      // Find the purchase that contains this number
      const purchase = soldNumber.raffle.purchases.find(p => {
        const numbers = JSON.parse(p.numbers)
        return numbers.includes(soldNumber.number)
      })

      return {
        number: soldNumber.number,
        userId: purchase?.user.id || "",
        userName: purchase?.user.name || "Usuário não encontrado",
        userEmail: purchase?.user.email || ""
      }
    }).filter(winner => winner.userId) // Filter out entries without valid user

    return NextResponse.json({
      raffle: {
        ...raffle,
        soldNumbers: raffle._count.numbers
      },
      winners
    })
  } catch (error) {
    console.error("Error fetching winner data:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

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

    const { winnerNumber, winnerId } = await request.json()

    // Update raffle with winner
    const raffle = await prisma.raffle.update({
      where: { id: params.id },
      data: {
        winnerNumber,
        winnerId,
        status: "FINISHED"
      }
    })

    return NextResponse.json({ raffle })
  } catch (error) {
    console.error("Error setting winner:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}