import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { resolveCountryCode } from '@/lib/country'

export async function GET() {
  const tds = await prisma.technicalDirector.findMany({ orderBy: { aerodynamics: 'desc' } })
  return NextResponse.json(tds.map((td) => ({
    ...td,
    nationalityCode: td.nationalityCode ?? resolveCountryCode(td.name),
  })))
}
