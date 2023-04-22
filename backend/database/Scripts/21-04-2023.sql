CREATE TABLE `teacher_file_managers` (
                                         `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                                         `file_manager_uuid` VARCHAR(36) NOT NULL COLLATE 'utf8mb4_general_ci',
                                         `teacher_id` BIGINT(20) NOT NULL,
                                         PRIMARY KEY (`id`) USING BTREE,
                                         INDEX `file_manager_uuid` (`file_manager_uuid`) USING BTREE,
                                         INDEX `teacher_id` (`teacher_id`) USING BTREE
)
    COMMENT='Administrador de archivos docentes'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
AUTO_INCREMENT=8
;

ALTER TABLE `students_file_managers`
    CHANGE COLUMN `student_id` `student_id` BIGINT NOT NULL AFTER `file_manager_uuid`;

DROP TABLE IF EXISTS teacher_file_managers;
DROP TABLE  IF EXISTS students_file_managers;
-- Path: database\Scripts\21-04-2023.sql

