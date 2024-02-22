-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "salt" TEXT NOT NULL,
    "QRCodeHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "signedIn" BOOLEAN NOT NULL,
    "signedInAt" DATETIME
);

-- CreateTable
CREATE TABLE "Skill" (
    "skill" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserEvents" (
    "event" TEXT NOT NULL,
    "userQRHash" TEXT NOT NULL,
    CONSTRAINT "UserEvents_userQRHash_fkey" FOREIGN KEY ("userQRHash") REFERENCES "User" ("QRCodeHash") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "event" TEXT NOT NULL PRIMARY KEY
);

-- CreateIndex
CREATE UNIQUE INDEX "User_salt_key" ON "User"("salt");

-- CreateIndex
CREATE UNIQUE INDEX "User_QRCodeHash_key" ON "User"("QRCodeHash");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_skill_userId_key" ON "Skill"("skill", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEvents_event_userQRHash_key" ON "UserEvents"("event", "userQRHash");

-- CreateIndex
CREATE UNIQUE INDEX "Event_event_key" ON "Event"("event");
