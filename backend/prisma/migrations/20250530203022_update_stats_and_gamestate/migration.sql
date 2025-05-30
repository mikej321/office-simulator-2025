/*
  Warnings:

  - You are about to drop the column `currentDay` on the `GameState` table. All the data in the column will be lost.
  - You are about to drop the column `fatigue` on the `Stats` table. All the data in the column will be lost.
  - You are about to drop the column `productivity` on the `Stats` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "projectProgress" INTEGER NOT NULL DEFAULT 0,
    "workDayCount" INTEGER NOT NULL DEFAULT 0,
    "workDayLimit" INTEGER NOT NULL DEFAULT 5,
    "workDayLimitReached" BOOLEAN NOT NULL DEFAULT false,
    "characterId" INTEGER NOT NULL,
    "lastSaved" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameState_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameState" ("characterId", "id", "lastSaved") SELECT "characterId", "id", "lastSaved" FROM "GameState";
DROP TABLE "GameState";
ALTER TABLE "new_GameState" RENAME TO "GameState";
CREATE UNIQUE INDEX "GameState_characterId_key" ON "GameState"("characterId");
CREATE TABLE "new_Stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentalPoints" INTEGER NOT NULL DEFAULT 3,
    "energyLevel" INTEGER NOT NULL DEFAULT 3,
    "motivationLevel" INTEGER NOT NULL DEFAULT 3,
    "focusLevel" INTEGER NOT NULL DEFAULT 3,
    "characterId" INTEGER NOT NULL,
    CONSTRAINT "Stats_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Stats" ("characterId", "id") SELECT "characterId", "id" FROM "Stats";
DROP TABLE "Stats";
ALTER TABLE "new_Stats" RENAME TO "Stats";
CREATE UNIQUE INDEX "Stats_characterId_key" ON "Stats"("characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
