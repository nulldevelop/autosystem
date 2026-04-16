-- AlterTable
ALTER TABLE `budget` ADD COLUMN `checklist` JSON NULL,
    ADD COLUMN `fuelLevel` VARCHAR(191) NULL,
    ADD COLUMN `kilometers` INTEGER NULL,
    ADD COLUMN `signature` TEXT NULL,
    ADD COLUMN `signedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `budget_photo` (
    `id` VARCHAR(191) NOT NULL,
    `budgetId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `budget_photo_budgetId_idx`(`budgetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budget_photo` ADD CONSTRAINT `budget_photo_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `budget`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
