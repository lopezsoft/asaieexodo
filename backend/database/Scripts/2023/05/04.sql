DROP TABLE IF EXISTS `file_managers`;
CREATE TABLE `file_managers` (
                                 `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                                 `file_manager_uuid` VARCHAR(36) NOT NULL COLLATE 'utf8mb4_general_ci',
                                 `belong_to_id` BIGINT(20) NULL DEFAULT NULL,
                                 `profile` ENUM('TEACHER','STUDENT','ADMIN','FAMILY','ANY','SCHOOL','USER','SIGNATURE') NOT NULL DEFAULT 'ANY' COLLATE 'utf8mb4_general_ci',
                                 `data` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_bin',
                                 PRIMARY KEY (`id`) USING BTREE,
                                 INDEX `file_manager_uuid` (`file_manager_uuid`) USING BTREE,
                                 INDEX `teacher_id` (`belong_to_id`) USING BTREE
)
    COMMENT='Administrador de archivos docentes'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
AUTO_INCREMENT=0
;
-- myschoolsadmin_exodo
CREATE TABLE `file_managers` (
                                 `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                 `uuid` VARCHAR(36) NOT NULL COLLATE 'utf8mb4_general_ci',
                                 `school_id` BIGINT(20) UNSIGNED NOT NULL,
                                 `user_id` BIGINT(20) UNSIGNED NOT NULL,
                                 `file_name` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                 `file_description` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                 `file_path` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                 `url` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                 `extension_file` VARCHAR(10) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                 `mime_type` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                 `size_file` VARCHAR(30) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                 `last_modified` DATETIME NULL DEFAULT NULL,
                                 `state` SMALLINT(1) NULL DEFAULT '1',
                                 PRIMARY KEY (`id`) USING BTREE,
                                 UNIQUE INDEX `uuid_uk` (`uuid`) USING BTREE,
                                 INDEX `school_id` (`school_id`) USING BTREE,
                                 INDEX `user_id` (`user_id`) USING BTREE,
                                 INDEX `file_name` (`file_name`) USING BTREE,
                                 INDEX `uuid` (`uuid`) USING BTREE,
                                 FULLTEXT INDEX `file_description` (`file_description`),
                                 CONSTRAINT `FK_file_manager_schools` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
                                 CONSTRAINT `FK_file_manager_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
)
    COMMENT='Administrador de archivos'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=0
;
-- Path: database\Scripts\2023\05\04.sql
