-- CreateTable
CREATE TABLE "QuarterlyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetMetric" TEXT NOT NULL,
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "category" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "QuarterlyGoal_createdById_idx" ON "QuarterlyGoal"("createdById");

-- CreateIndex
CREATE INDEX "QuarterlyGoal_quarter_year_idx" ON "QuarterlyGoal"("quarter", "year");

-- CreateIndex
CREATE INDEX "QuarterlyGoal_status_idx" ON "QuarterlyGoal"("status");
