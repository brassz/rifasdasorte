import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateRaffleNumbers } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const {
      title,
      description,
      totalNumbers,
      pricePerNumber,
      startDate,
      endDate,
      image,
      packages
    } = await request.json()

    // Create raffle
    const raffle = await prisma.raffle.create({
      data: {
        title,
        description,
        totalNumbers,
        pricePerNumber,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        image,
        status: "ACTIVE",
        ownerId: session.user.id
      }
    })

    // Generate raffle numbers
    const numbers = generateRaffleNumbers(totalNumbers)
    await prisma.raffleNumber.createMany({
      data: numbers.map(number => ({
        number,
        raffleId: raffle.id
      }))
    })

    // Create packages if provided
    if (packages && packages.length > 0) {
      await prisma.package.createMany({
        data: packages.map((pkg: any) => ({
          name: pkg.name,
          description: `${pkg.numbers} números com ${pkg.discount}% de desconto`,
          numbers: pkg.numbers,
          price: pkg.price,
          discount: pkg.discount,
          raffleId: raffle.id
        }))
      })
    }

    return NextResponse.json({ raffle })
  } catch (error) {
    console.error("Error creating raffle:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const raffles = await prisma.raffle.findMany({
      include: {
        _count: {
          select: {
            numbers: {
              where: {
                isSold: true
              }
            },
            purchases: {
              where: {
                status: "PAID"
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
      totalRevenue: raffle._count.purchases * raffle.pricePerNumber,
      createdAt: raffle.createdAt,
      endDate: raffle.endDate,
      image: raffle.image
    }))

    return NextResponse.json(formattedRaffles)
  } catch (error) {
    console.error("Error fetching admin raffles:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}