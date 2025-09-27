import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const [
      totalRaffles,
      activeRaffles,
      totalUsers,
      totalRevenue
    ] = await Promise.all([
      prisma.raffle.count(),
      prisma.raffle.count({
        where: { status: "ACTIVE" }
      }),
      prisma.user.count({
        where: { role: "USER" }
      }),
      prisma.purchase.aggregate({
        where: { status: "PAID" },
        _sum: { total: true }
      })
    ])

    return NextResponse.json({
      totalRaffles,
      activeRaffles,
      totalUsers,
      totalRevenue: totalRevenue._sum.total || 0
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}