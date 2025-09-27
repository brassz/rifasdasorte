import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
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

    const raffleId = params.id

    // Verificar se a rifa existe
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        _count: {
          select: {
            numbers: {
              where: { isSold: true }
            },
            purchases: true
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

    // Verificar se há números vendidos ou compras
    if (raffle._count.numbers > 0 || raffle._count.purchases > 0) {
      return NextResponse.json(
        { error: "Não é possível apagar uma rifa que já possui números vendidos ou compras. Finalize a rifa primeiro." },
        { status: 400 }
      )
    }

    // Deletar a rifa e todos os dados relacionados
    await prisma.$transaction(async (tx) => {
      // Deletar números da rifa
      await tx.raffleNumber.deleteMany({
        where: { raffleId }
      })

      // Deletar pacotes da rifa
      await tx.package.deleteMany({
        where: { raffleId }
      })

      // Deletar a rifa
      await tx.raffle.delete({
        where: { id: raffleId }
      })
    })

    return NextResponse.json({ 
      message: "Rifa apagada com sucesso",
      raffle: {
        id: raffle.id,
        title: raffle.title
      }
    })

  } catch (error) {
    console.error("Error deleting raffle:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}