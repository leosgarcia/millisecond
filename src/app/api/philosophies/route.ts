import { NextResponse } from 'next/server'
import { getTeamPhilosophies } from '@/domain/teams/philosophies'

export async function GET() {
  return NextResponse.json(getTeamPhilosophies())
}
