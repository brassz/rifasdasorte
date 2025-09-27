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

    if (soldNumbers.length === 0) {
      return NextResponse.json(
        { error: "Nenhum número foi vendido" },
        { status: 400 }
      )
    }

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

    if (winners.length === 0) {
      return NextResponse.json(
        { error: "Nenhum vencedor válido encontrado" },
        { status: 400 }
      )
    }

    // Select random winner
    const randomIndex = Math.floor(Math.random() * winners.length)
    const selectedWinner = winners[randomIndex]

    return NextResponse.json({ winner: selectedWinner })
  } catch (error) {
    console.error("Error selecting random winner:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}