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
    "actionsUsed" INTEGER NOT NULL DEFAULT 0,
    "currentScene" TEXT NOT NULL DEFAULT 'TestScene',
    "characterId" INTEGER NOT NULL,
    "lastSaved" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameState_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameState" ("actionsUsed", "characterId", "id", "lastSaved", "losses", "projectProgress", "wins", "workDayCount", "workDayLimit", "workDayLimitReached") SELECT "actionsUsed", "characterId", "id", "lastSaved", "losses", "projectProgress", "wins", "workDayCount", "workDayLimit", "workDayLimitReached" FROM "GameState";
DROP TABLE "GameState";
ALTER TABLE "new_GameState" RENAME TO "GameState";
CREATE UNIQUE INDEX "GameState_characterId_key" ON "GameState"("characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
