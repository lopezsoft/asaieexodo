
ALTER TABLE `file_managers`
    ADD COLUMN `uuid` VARCHAR(36) NOT NULL AFTER `id`,
	ADD COLUMN `file_description` VARCHAR(200) NULL DEFAULT NULL AFTER `file_name`,
	ADD INDEX `uuid` (`uuid`),
	ADD UNIQUE INDEX `uuid_uk` (`uuid`),
	ADD FULLTEXT INDEX `file_description` (`file_description`);
ALTER TABLE `file_managers`
    CHANGE COLUMN `mime_type` `mime_type` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci' AFTER `extension_file`;
