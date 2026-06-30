# Dataset Audit

Generated at: 2026-06-28T22:59:42.703Z
Source: `data/curated`

## Summary

- Drivers: 66
- Cars: 22
- Engines: 36
- Team principals: 20
- Technical directors: 21

## Sanity Signals

- [WARNING] driver/driver-qualifying-elite: Jim Clark - Qualifying pace 99 is reserved for historic qualifiers of exceptional status.
- [WARNING] driver/driver-consistency-elite: Jackie Stewart - Consistency 98 is extremely rare and should appear only in very few cases.
- [WARNING] driver/driver-consistency-elite: Niki Lauda - Consistency 99 is extremely rare and should appear only in very few cases.
- [INFO] driver/driver-high-aggression: Gilles Villeneuve - Aggression 100 should come with real trade-offs in incident risk or cost.
- [WARNING] driver/driver-consistency-elite: Alain Prost - Consistency 99 is extremely rare and should appear only in very few cases.
- [WARNING] driver/driver-qualifying-elite: Ayrton Senna - Qualifying pace 100 is reserved for historic qualifiers of exceptional status.
- [INFO] driver/driver-high-aggression: Ayrton Senna - Aggression 96 should come with real trade-offs in incident risk or cost.
- [CRITICAL] driver/driver-too-perfect: Ayrton Senna - Driver has 7 attributes at 95+; the profile is likely too perfect.
- [WARNING] driver/driver-qualifying-elite: Ayrton Senna - Qualifying pace 100 is reserved for historic qualifiers of exceptional status.
- [CRITICAL] driver/driver-too-perfect: Ayrton Senna - Driver has 7 attributes at 95+; the profile is likely too perfect.
- [INFO] driver/driver-high-aggression: Nigel Mansell - Aggression 96 should come with real trade-offs in incident risk or cost.
- [WARNING] driver/driver-consistency-elite: Alain Prost - Consistency 98 is extremely rare and should appear only in very few cases.

## Wet Skill Audit

- 98+ elite absolute: 3
- 94-97 elite: 8
- 88-93 strong: 11
- 94+ review group: 11 (16.7%)

### Top Wet Drivers

1. Ayrton Senna 1991 - 100
2. Ayrton Senna 1988 - 99
3. Lewis Hamilton 2008 - 98
4. Michael Schumacher 1995 - 96
5. Lewis Hamilton 2020 - 96
6. Max Verstappen 2023 - 95
7. Jim Clark 1965 - 94
8. Michael Schumacher 2002 - 94
9. Jenson Button 2009 - 94
10. Fernando Alonso 2012 - 94

### Recommendations

- 3 drivers sit at 98+ wet skill. This should remain a tiny group of absolute outliers.
- 11 drivers sit at 94+ wet skill (16.7% of the grid). The target is roughly 15-20% or less.
- 15 drivers are at 80 or below. These are the profiles that can be used to restore contrast if the top end is too flat.

## Drivers

### qualifyingPace
- Mean: 91.8
- Median: 92.5
- Min/Max: 78 / 100
- Std Dev: 5.6
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### racePace
- Mean: 92.3
- Median: 92
- Min/Max: 80 / 99
- Std Dev: 4.8
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### wetSkill
- Mean: 85.0
- Median: 84
- Min/Max: 68 / 100
- Std Dev: 6.6
- Outliers: 5
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### tireManagement
- Mean: 89.5
- Median: 89.5
- Min/Max: 76 / 98
- Std Dev: 5.2
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### overtaking
- Mean: 88.1
- Median: 88
- Min/Max: 74 / 99
- Std Dev: 6.1
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### defending
- Mean: 89.0
- Median: 88.5
- Min/Max: 78 / 98
- Std Dev: 4.1
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### consistency
- Mean: 89.9
- Median: 90
- Min/Max: 78 / 99
- Std Dev: 5.9
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### adaptability
- Mean: 90.1
- Median: 90
- Min/Max: 80 / 100
- Std Dev: 5.0
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### technicalFeedback
- Mean: 89.9
- Median: 88.5
- Min/Max: 80 / 99
- Std Dev: 4.7
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### pressureHandling
- Mean: 90.6
- Median: 89
- Min/Max: 78 / 99
- Std Dev: 6.1
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### aggression
- Mean: 79.7
- Median: 78
- Min/Max: 62 / 100
- Std Dev: 9.4
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### teamPlay
- Mean: 83.0
- Median: 85.5
- Min/Max: 62 / 99
- Std Dev: 8.0
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### errorProneness
- Mean: 10.8
- Median: 10
- Min/Max: 4 / 24
- Std Dev: 4.1
- Outliers: 1
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### incidentRisk
- Mean: 14.9
- Median: 14
- Min/Max: 7 / 35
- Std Dev: 5.4
- Outliers: 1
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### politicalTension
- Mean: 20.2
- Median: 15.5
- Min/Max: 6 / 55
- Std Dev: 12.5
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30

### budgetCost
- Mean: 159.2
- Median: 165
- Min/Max: 70 / 230
- Std Dev: 46.4
- Outliers: 0
- Tier distribution: S:26, B:19, A:19, C:2
- Role distribution: primary:36, secondary:30


## Cars

### aeroEfficiency
- Mean: 95.8
- Median: 96.5
- Min/Max: 91 / 99
- Std Dev: 2.4
- Outliers: 0

### slowCorner
- Mean: 93.5
- Median: 95
- Min/Max: 85 / 99
- Std Dev: 3.6
- Outliers: 0

### mediumCorner
- Mean: 96.4
- Median: 95
- Min/Max: 92 / 99
- Std Dev: 1.9
- Outliers: 0

### fastCorner
- Mean: 96
- Median: 98
- Min/Max: 90 / 100
- Std Dev: 3.4
- Outliers: 0

### straightLineSpeed
- Mean: 93.1
- Median: 95
- Min/Max: 85 / 99
- Std Dev: 4.8
- Outliers: 0

### mechanicalGrip
- Mean: 94.5
- Median: 94
- Min/Max: 91 / 98
- Std Dev: 1.6
- Outliers: 0

### braking
- Mean: 93.9
- Median: 95
- Min/Max: 90 / 98
- Std Dev: 2.5
- Outliers: 0

### tireWear
- Mean: 89.2
- Median: 90
- Min/Max: 78 / 98
- Std Dev: 4.6
- Outliers: 0

### setupWindow
- Mean: 86.8
- Median: 90
- Min/Max: 60 / 95
- Std Dev: 8.7
- Outliers: 1

### reliability
- Mean: 91.0
- Median: 93.5
- Min/Max: 68 / 98
- Std Dev: 7.6
- Outliers: 2

### developmentPotential
- Mean: 86.5
- Median: 85
- Min/Max: 60 / 99
- Std Dev: 8.7
- Outliers: 1

### budgetCost
- Mean: 230.2
- Median: 230
- Min/Max: 210 / 250
- Std Dev: 12.2
- Outliers: 0


## Engines

### power
- Mean: 95.2
- Median: 96
- Min/Max: 82 / 100
- Std Dev: 4.5
- Outliers: 2

### torqueDelivery
- Mean: 92.8
- Median: 94
- Min/Max: 82 / 98
- Std Dev: 3.4
- Outliers: 3

### drivability
- Mean: 92.3
- Median: 94
- Min/Max: 82 / 97
- Std Dev: 3.9
- Outliers: 3

### fuelEfficiency
- Mean: 89.6
- Median: 90
- Min/Max: 82 / 98
- Std Dev: 4.5
- Outliers: 0

### energyRecovery
- Mean: 59.2
- Median: 50
- Min/Max: 50 / 99
- Std Dev: 18.8
- Outliers: 7

### weightEfficiency
- Mean: 92.8
- Median: 95
- Min/Max: 85 / 98
- Std Dev: 3.4
- Outliers: 0

### reliability
- Mean: 91.3
- Median: 95
- Min/Max: 70 / 99
- Std Dev: 7.7
- Outliers: 3

### coolingDemand
- Mean: 87.2
- Median: 88
- Min/Max: 75 / 92
- Std Dev: 4.3
- Outliers: 1

### qualifyingMode
- Mean: 94.7
- Median: 95
- Min/Max: 80 / 100
- Std Dev: 4.7
- Outliers: 4

### racePaceSustainability
- Mean: 93.1
- Median: 95
- Min/Max: 76 / 99
- Std Dev: 5.2
- Outliers: 2

### budgetCost
- Mean: 147
- Median: 150
- Min/Max: 65 / 180
- Std Dev: 27.8
- Outliers: 4


## Team Principals

### leadership
- Mean: 87.2
- Median: 87
- Min/Max: 76 / 99
- Std Dev: 7.2
- Outliers: 0

### politics
- Mean: 85.5
- Median: 84
- Min/Max: 76 / 98
- Std Dev: 6.7
- Outliers: 0

### crisisManagement
- Mean: 83.0
- Median: 84
- Min/Max: 68 / 96
- Std Dev: 7.9
- Outliers: 0

### driverManagement
- Mean: 81.5
- Median: 82
- Min/Max: 58 / 98
- Std Dev: 9.2
- Outliers: 1

### operationalDiscipline
- Mean: 83.1
- Median: 84.5
- Min/Max: 68 / 99
- Std Dev: 10.1
- Outliers: 0

### strategicPatience
- Mean: 84.5
- Median: 87
- Min/Max: 68 / 98
- Std Dev: 8.3
- Outliers: 0

### riskTolerance
- Mean: 79.3
- Median: 77
- Min/Max: 64 / 100
- Std Dev: 9.5
- Outliers: 0

### developmentCulture
- Mean: 88.8
- Median: 91
- Min/Max: 70 / 100
- Std Dev: 8.5
- Outliers: 0

### budgetCost
- Mean: 84.8
- Median: 84
- Min/Max: 50 / 122
- Std Dev: 19.9
- Outliers: 0


## Technical Directors

### aerodynamics
- Mean: 89.2
- Median: 88
- Min/Max: 80 / 100
- Std Dev: 5.0
- Outliers: 0

### mechanicalDesign
- Mean: 91.8
- Median: 92
- Min/Max: 84 / 99
- Std Dev: 4.3
- Outliers: 0

### innovation
- Mean: 90.6
- Median: 90
- Min/Max: 84 / 100
- Std Dev: 5.6
- Outliers: 0

### reliabilityFocus
- Mean: 87.0
- Median: 88
- Min/Max: 55 / 98
- Std Dev: 9.0
- Outliers: 1

### developmentSpeed
- Mean: 89.9
- Median: 90
- Min/Max: 84 / 96
- Std Dev: 3.7
- Outliers: 0

### regulationExploitation
- Mean: 90.7
- Median: 90
- Min/Max: 84 / 99
- Std Dev: 5.0
- Outliers: 0

### setupUnderstanding
- Mean: 91.5
- Median: 92
- Min/Max: 86 / 98
- Std Dev: 3.6
- Outliers: 0

### budgetCost
- Mean: 104.2
- Median: 104
- Min/Max: 76 / 150
- Std Dev: 21.7
- Outliers: 0

