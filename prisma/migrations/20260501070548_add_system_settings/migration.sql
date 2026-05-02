-- CreateTable
CREATE TABLE `SystemSetting` (
    `id` VARCHAR(191) NOT NULL,
    `gymName` VARCHAR(191) NOT NULL DEFAULT 'Dolphin Fitness Center',
    `monthlyFee` INTEGER NOT NULL DEFAULT 3500,
    `personalTrainingFee` INTEGER NOT NULL DEFAULT 15000,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'LKR',
    `reminderDaysBefore` INTEGER NOT NULL DEFAULT 3,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
