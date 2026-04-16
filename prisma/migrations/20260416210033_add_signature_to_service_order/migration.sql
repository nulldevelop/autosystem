-- AlterTable
ALTER TABLE `service_order` ADD COLUMN `signature` TEXT NULL,
    ADD COLUMN `signedAt` DATETIME(3) NULL;
