import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { resolveCountryCode } from '@/lib/country'

export async function GET() {
  const drivers = await prisma.driver.findMany({ orderBy: { overall: 'desc' } })
  const parsed = drivers.map((d) => ({
    ...d,
    nationalityCode: d.nationalityCode ?? resolveCountryCode(d.nationality),
    preferredCarTraits: JSON.parse(d.preferredCarTraits),
    weakCarTraits: JSON.parse(d.weakCarTraits),
  }))
  return NextResponse.json(parsed)
}
