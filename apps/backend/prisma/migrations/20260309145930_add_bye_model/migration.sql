-- CreateTable
CREATE TABLE "Bye" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "Bye_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bye_roundId_key" ON "Bye"("roundId");

-- CreateIndex
CREATE INDEX "Bye_playerId_idx" ON "Bye"("playerId");

-- AddForeignKey
ALTER TABLE "Bye" ADD CONSTRAINT "Bye_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bye" ADD CONSTRAINT "Bye_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
