import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const raffles = await prisma.raffle.findMany({
      where: {
        status: {
          in: ["ACTIVE", "FINISHED"]
        }
      },
      include: {
        numbers: {
          where: {
            isSold: true
          }
        },
        _count: {
          select: {
            numbers: {
              where: {
                isSold: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const formattedRaffles = raffles.map(raffle => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      totalNumbers: raffle.totalNumbers,
      pricePerNumber: raffle.pricePerNumber,
      status: raffle.status,
      soldNumbers: raffle._count.numbers,
      endDate: raffle.endDate,
      image: raffle.image,
      winnerNumber: raffle.winnerNumber
    }))

    return NextResponse.json(formattedRaffles)
  } catch (error) {
    console.error("Error fetching raffles:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}