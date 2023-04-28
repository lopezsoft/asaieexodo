
CREATE TABLE `students_file_managers` (
          `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
          `file_manager_uuid` VARCHAR(36) NOT NULL COLLATE 'utf8mb4_general_ci',
          `student_id` INT(11) NOT NULL,
          PRIMARY KEY (`id`) USING BTREE,
          INDEX `file_manager_uuid` (`file_manager_uuid`) USING BTREE,
          INDEX `student_id` (`student_id`) USING BTREE
)
    COMMENT='Administrador de archivos estudiantes'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1
;
