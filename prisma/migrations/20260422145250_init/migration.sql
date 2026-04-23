-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "mealPeriod" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "servingSize" TEXT,
    "calories" INTEGER,
    "protein" REAL,
    "carbs" REAL,
    "fat" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FoodLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "menuItemId" TEXT,
    "itemName" TEXT NOT NULL,
    "servingSize" TEXT,
    "multiplier" REAL NOT NULL DEFAULT 1.0,
    "calories" INTEGER,
    "protein" REAL,
    "carbs" REAL,
    "fat" REAL,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodLog_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserGoals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calories" INTEGER NOT NULL DEFAULT 2000,
    "protein" INTEGER NOT NULL DEFAULT 150,
    "carbs" INTEGER NOT NULL DEFAULT 250,
    "fat" INTEGER NOT NULL DEFAULT 65
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_date_name_mealPeriod_station_key" ON "MenuItem"("date", "name", "mealPeriod", "station");
