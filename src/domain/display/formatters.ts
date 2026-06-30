export function formatDriverName(driver: any, t?: any): string {
  if (!driver) return t ? t('common.notFound', { defaultMessage: 'Item não encontrado' }) : 'Item not found'
  return driver.seasonYear ? `${driver.name} ${driver.seasonYear}` : driver.name
}

export function formatCarName(car: any, t?: any): string {
  if (!car) return t ? t('common.notFound', { defaultMessage: 'Item não encontrado' }) : 'Item not found'
  return car.seasonYear ? `${car.name} ${car.seasonYear}` : car.name
}

export function formatEngineName(engine: any, t?: any): string {
  if (!engine) return t ? t('common.notFound', { defaultMessage: 'Item não encontrado' }) : 'Item not found'
  return engine.seasonYear ? `${engine.manufacturer} ${engine.name} ${engine.seasonYear}` : `${engine.manufacturer} ${engine.name}`
}

export function formatTeamPrincipalName(teamPrincipal: any, t?: any): string {
  if (!teamPrincipal) return t ? t('common.notFound', { defaultMessage: 'Item não encontrado' }) : 'Item not found'
  return teamPrincipal.name
}

export function formatTechnicalDirectorName(technicalDirector: any, t?: any): string {
  if (!technicalDirector) return t ? t('common.notFound', { defaultMessage: 'Item não encontrado' }) : 'Item not found'
  return technicalDirector.name
}

export function formatCircuitName(circuit: any, t?: any): string {
  if (!circuit) return t ? t('common.notFound', { defaultMessage: 'Item não encontrado' }) : 'Item not found'
  return circuit.name
}

export function formatCampaignTeamName(team: any, t?: any): string {
  if (!team) return t ? t('common.notFound', { defaultMessage: 'Item não encontrado' }) : 'Item not found'
  return team.name
}
