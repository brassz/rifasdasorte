import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        pricePerNumber: true,
        status: true
      }
    })

    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa não encontrada" },
        { status: 404 }
      )
    }

    const packages = await prisma.package.findMany({
      where: {
        raffleId: params.id,
        isActive: true
      },
      orderBy: {
        numbers: "asc"
      }
    })

    return NextResponse.json({
      raffle,
      packages
    })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}