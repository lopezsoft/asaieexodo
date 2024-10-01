ALTER TABLE `config001`
    ADD COLUMN `fail_subject_of_the_area` TINYINT(1) NOT NULL DEFAULT '0' COMMENT 'si pierde una asignatura de áreas compuestas, pierde el area' AFTER `aplicar_redondeo_fin_año`;
