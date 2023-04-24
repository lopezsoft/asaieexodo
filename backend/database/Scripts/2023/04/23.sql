ALTER TABLE `file_managers`
    CHANGE COLUMN `belong_to_id` `belong_to_id` BIGINT(20) NULL DEFAULT NULL AFTER `file_manager_uuid`,
    CHANGE COLUMN `profile` `profile` ENUM('TEACHER','STUDENT','ADMIN','FAMILY','ANY','SCHOOL','USER', 'SIGNATURE') NOT NULL DEFAULT 'ANY' COLLATE 'utf8mb4_general_ci' AFTER `belong_to_id`;

ALTER TABLE `file_managers`
    ADD COLUMN `url` VARCHAR(200) NULL DEFAULT NULL AFTER `file_path`;
