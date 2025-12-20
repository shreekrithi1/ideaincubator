-- AlterTable
ALTER TABLE "QuarterlyGoal" ADD COLUMN "deadline" DATETIME;

-- CreateTable
CREATE TABLE "GoalContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "contributorName" TEXT NOT NULL,
    "contributorRole" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "QuarterlyGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GoalContribution_goalId_idx" ON "GoalContribution"("goalId");

-- CreateIndex
CREATE INDEX "GoalContribution_contributorId_idx" ON "GoalContribution"("contributorId");
