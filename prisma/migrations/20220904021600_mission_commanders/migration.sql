-- CreateTable
CREATE TABLE "mission_commanders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "missionCommander" VARCHAR(255) NOT NULL,
    "enrollments" INTEGER NOT NULL,
    "hasCertification" BOOLEAN NOT NULL DEFAULT true,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_commanders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mission_commanders_name_key" ON "mission_commanders"("name");
