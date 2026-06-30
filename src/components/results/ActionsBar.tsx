export default function ActionsBar({
  copyLabel,
  copiedLabel,
  simulateAgainLabel,
  newTeamLabel,
  onCopy,
  onSimulateAgain,
  onNewTeam,
  copied,
}: {
  copyLabel: string
  copiedLabel: string
  simulateAgainLabel: string
  newTeamLabel: string
  onCopy: () => void
  onSimulateAgain: () => void
  onNewTeam: () => void
  copied: boolean
}) {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 border-t border-[var(--border-subtle)] pt-8 pb-12">
      <button className="button-technical" onClick={onCopy}>
        {copied ? copiedLabel : copyLabel}
      </button>
      <button className="button-technical" onClick={onSimulateAgain}>
        {simulateAgainLabel}
      </button>
      <button className="button-primary" onClick={onNewTeam}>
        {newTeamLabel}
      </button>
    </div>
  )
}
