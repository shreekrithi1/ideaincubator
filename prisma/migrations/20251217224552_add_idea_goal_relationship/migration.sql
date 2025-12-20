-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Idea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT DEFAULT 'General',
    "tShirtSize" TEXT,
    "riskMitigation" TEXT,
    "executiveSponsor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "jiraTicketId" TEXT,
    "jiraStatus" TEXT,
    "businessValueScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submitterId" TEXT NOT NULL,
    "quarterlyGoalId" TEXT,
    CONSTRAINT "Idea_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Idea_quarterlyGoalId_fkey" FOREIGN KEY ("quarterlyGoalId") REFERENCES "QuarterlyGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Idea" ("businessValueScore", "category", "createdAt", "description", "executiveSponsor", "id", "jiraStatus", "jiraTicketId", "riskMitigation", "status", "submitterId", "tShirtSize", "title", "updatedAt") SELECT "businessValueScore", "category", "createdAt", "description", "executiveSponsor", "id", "jiraStatus", "jiraTicketId", "riskMitigation", "status", "submitterId", "tShirtSize", "title", "updatedAt" FROM "Idea";
DROP TABLE "Idea";
ALTER TABLE "new_Idea" RENAME TO "Idea";
CREATE INDEX "Idea_quarterlyGoalId_idx" ON "Idea"("quarterlyGoalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
