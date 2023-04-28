CREATE TABLE `file_manager` (
                                `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
                                `school_id` BIGINT(20) UNSIGNED NOT NULL,
                                `user_id` BIGINT(20) UNSIGNED NOT NULL,
                                `file_name` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                `file_path` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                `extension_file` VARCHAR(10) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                `mime_type` VARCHAR(30) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                `size_file` VARCHAR(30) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
                                `last_modified` DATETIME NULL DEFAULT NULL,
                                `state` SMALLINT(1) NULL DEFAULT '1',
                                PRIMARY KEY (`id`) USING BTREE,
                                INDEX `school_id` (`school_id`) USING BTREE,
                                INDEX `user_id` (`user_id`) USING BTREE,
                                INDEX `file_name` (`file_name`) USING BTREE,
                                CONSTRAINT `FK_file_manager_schools` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
                                CONSTRAINT `FK_file_manager_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
)
    COMMENT='Administrador de archivos'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
