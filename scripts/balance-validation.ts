import { buildBalanceValidationConfig, runAndWriteBalanceValidationSuite } from './balance-validation-lib'

function main() {
  const config = buildBalanceValidationConfig(process.argv.slice(2))
  const report = runAndWriteBalanceValidationSuite(config)
  console.log(
    [
      `Balance validation completed in ${report.summary.status} mode`,
      `runs=${report.summary.totalSimulations}`,
      `winRate=${(report.summary.playerWinRate * 100).toFixed(1)}%`,
      `alerts=${report.alerts.length}`,
    ].join(' | ')
  )
}

main()
