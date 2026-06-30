import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { resolveCountryCode } from '@/lib/country'

export async function GET() {
  const engines = await prisma.engine.findMany({ orderBy: { overall: 'desc' } })
  const parsed = engines.map((e) => ({
    ...e,
    manufacturerCountryCode: e.manufacturerCountryCode ?? resolveCountryCode(e.manufacturer),
    compatibleEras: JSON.parse(e.compatibleEras),
  }))
  return NextResponse.json(parsed)
}
