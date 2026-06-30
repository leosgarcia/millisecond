import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { resolveCountryCode } from '@/lib/country'

export async function GET() {
  const circuits = await prisma.circuit.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(circuits.map((c) => ({
    ...c,
    countryCode: c.countryCode ?? resolveCountryCode(c.country),
  })))
}
