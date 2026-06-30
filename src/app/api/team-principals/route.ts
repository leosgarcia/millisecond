import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { resolveCountryCode } from '@/lib/country'

export async function GET() {
  const tps = await prisma.teamPrincipal.findMany({ orderBy: { leadership: 'desc' } })
  return NextResponse.json(tps.map((tp) => ({
    ...tp,
    nationalityCode: tp.nationalityCode ?? resolveCountryCode(tp.name),
  })))
}
