export function formatDriverName(driver: { name: string; seasonYear: number }): string {
  return `${driver.name} ${driver.seasonYear}`
}
