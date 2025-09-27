import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: params.id },
      include: {
        packages: {
          where: { isActive: true }
        },
        numbers: {
          orderBy: { number: "asc" }
        },
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

    const formattedRaffle = {
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      totalNumbers: raffle.totalNumbers,
      pricePerNumber: raffle.pricePerNumber,
      status: raffle.status,
      soldNumbers: raffle._count.numbers,
      endDate: raffle.endDate,
      image: raffle.image,
      packages: raffle.packages
    }

    const formattedNumbers = raffle.numbers.map(number => ({
      number: number.number,
      isSold: number.isSold
    }))

    return NextResponse.json({
      raffle: formattedRaffle,
      numbers: formattedNumbers
    })
  } catch (error) {
    console.error("Error fetching raffle:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}