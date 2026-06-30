-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "era" TEXT NOT NULL,
    "overall" REAL NOT NULL,
    "qualifyingPace" REAL NOT NULL,
    "racePace" REAL NOT NULL,
    "wetSkill" REAL NOT NULL,
    "tireManagement" REAL NOT NULL,
    "overtaking" REAL NOT NULL,
    "defending" REAL NOT NULL,
    "consistency" REAL NOT NULL,
    "adaptability" REAL NOT NULL,
    "technicalFeedback" REAL NOT NULL,
    "pressureHandling" REAL NOT NULL,
    "aggression" REAL NOT NULL,
    "teamPlay" REAL NOT NULL,
    "errorProneness" REAL NOT NULL,
    "incidentRisk" REAL NOT NULL,
    "politicalTension" REAL NOT NULL,
    "preferredCarTraits" TEXT NOT NULL,
    "weakCarTraits" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "era" TEXT NOT NULL,
    "overall" REAL NOT NULL,
    "aeroEfficiency" REAL NOT NULL,
    "slowCorner" REAL NOT NULL,
    "mediumCorner" REAL NOT NULL,
    "fastCorner" REAL NOT NULL,
    "straightLineSpeed" REAL NOT NULL,
    "mechanicalGrip" REAL NOT NULL,
    "braking" REAL NOT NULL,
    "tireWear" REAL NOT NULL,
    "setupWindow" REAL NOT NULL,
    "reliability" REAL NOT NULL,
    "developmentPotential" REAL NOT NULL,
    "stableRear" REAL NOT NULL,
    "strongFrontEnd" REAL NOT NULL,
    "nervousRear" REAL NOT NULL,
    "traction" REAL NOT NULL,
    "strengths" TEXT NOT NULL DEFAULT '',
    "weaknesses" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Engine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "era" TEXT NOT NULL,
    "overall" REAL NOT NULL,
    "power" REAL NOT NULL,
    "torqueDelivery" REAL NOT NULL,
    "drivability" REAL NOT NULL,
    "fuelEfficiency" REAL NOT NULL,
    "energyRecovery" REAL NOT NULL,
    "weightEfficiency" REAL NOT NULL,
    "reliability" REAL NOT NULL,
    "coolingDemand" REAL NOT NULL,
    "qualifyingMode" REAL NOT NULL,
    "racePaceSustainability" REAL NOT NULL,
    "compatibleEras" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TeamPrincipal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "era" TEXT NOT NULL,
    "leadership" REAL NOT NULL,
    "politics" REAL NOT NULL,
    "crisisManagement" REAL NOT NULL,
    "driverManagement" REAL NOT NULL,
    "operationalDiscipline" REAL NOT NULL,
    "strategicPatience" REAL NOT NULL,
    "riskTolerance" REAL NOT NULL,
    "developmentCulture" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TechnicalDirector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "era" TEXT NOT NULL,
    "aerodynamics" REAL NOT NULL,
    "mechanicalDesign" REAL NOT NULL,
    "innovation" REAL NOT NULL,
    "reliabilityFocus" REAL NOT NULL,
    "developmentSpeed" REAL NOT NULL,
    "regulationExploitation" REAL NOT NULL,
    "setupUnderstanding" REAL NOT NULL,
    "riskProfile" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Circuit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "straightDemand" REAL NOT NULL,
    "slowCornerDemand" REAL NOT NULL,
    "mediumCornerDemand" REAL NOT NULL,
    "fastCornerDemand" REAL NOT NULL,
    "brakingDemand" REAL NOT NULL,
    "mechanicalGripDemand" REAL NOT NULL,
    "aeroDemand" REAL NOT NULL,
    "tireStress" REAL NOT NULL,
    "overtakingDifficulty" REAL NOT NULL,
    "qualifyingImportance" REAL NOT NULL,
    "rainProbability" REAL NOT NULL,
    "safetyCarProbability" REAL NOT NULL,
    "reliabilityStress" REAL NOT NULL,
    "driverErrorStress" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TeamPhilosophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "qualifyingModifier" REAL NOT NULL DEFAULT 0,
    "raceModifier" REAL NOT NULL DEFAULT 0,
    "reliabilityModifier" REAL NOT NULL DEFAULT 0,
    "tireModifier" REAL NOT NULL DEFAULT 0,
    "aggressionModifier" REAL NOT NULL DEFAULT 0,
    "developmentModifier" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "raceCount" INTEGER NOT NULL DEFAULT 7,
    "selectedTeam" TEXT NOT NULL,
    "ghostTeams" TEXT NOT NULL DEFAULT '[]',
    "results" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
