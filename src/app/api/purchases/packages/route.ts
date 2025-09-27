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

    const { raffleId, packageId } = await request.json()

    console.log("Package purchase request:", { raffleId, packageId, userId: session.user.id })

    if (!raffleId || !packageId) {
      return NextResponse.json(
        { error: "raffleId e packageId são obrigatórios" },
        { status: 400 }
      )
    }

    // Get package details
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        raffle: true
      }
    })

    if (!pkg) {
      console.log("Package not found:", packageId)
      return NextResponse.json(
        { error: "Pacote não encontrado" },
        { status: 404 }
      )
    }

    if (pkg.raffleId !== raffleId) {
      console.log("Package raffle mismatch:", { packageRaffleId: pkg.raffleId, requestedRaffleId: raffleId })
      return NextResponse.json(
        { error: "Pacote não pertence a esta rifa" },
        { status: 400 }
      )
    }

    if (pkg.raffle.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Rifa não está ativa" },
        { status: 400 }
      )
    }

    // Get available numbers for this raffle
    const availableNumbers = await prisma.raffleNumber.findMany({
      where: {
        raffleId,
        isSold: false
      },
      orderBy: { number: "asc" },
      take: pkg.numbers
    })

    if (availableNumbers.length < pkg.numbers) {
      return NextResponse.json(
        { error: "Não há números suficientes disponíveis" },
        { status: 400 }
      )
    }

    const numbers = availableNumbers.map(n => n.number)

    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        numbers: JSON.stringify(numbers),
        total: pkg.price,
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
    console.error("Error purchasing package:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}