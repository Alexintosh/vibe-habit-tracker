-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "frequency" TEXT NOT NULL,
    "goal" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Habit" ("color", "createdAt", "description", "frequency", "goal", "id", "name") SELECT "color", "createdAt", "description", "frequency", "goal", "id", "name" FROM "Habit";
DROP TABLE "Habit";
ALTER TABLE "new_Habit" RENAME TO "Habit";
CREATE INDEX "Habit_createdAt_idx" ON "Habit"("createdAt");
CREATE INDEX "Habit_order_idx" ON "Habit"("order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
