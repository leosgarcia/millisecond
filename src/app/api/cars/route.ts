import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { resolveCountryCode } from '@/lib/country'

export async function GET() {
  const cars = await prisma.car.findMany({ orderBy: { overall: 'desc' } })
  return NextResponse.json(cars.map((car) => ({
    ...car,
    teamCountryCode: car.teamCountryCode ?? resolveCountryCode(car.teamName),
  })))
}
