ALTER TABLE `obs_observer_mod_5`
    CHANGE COLUMN `id` `id` BIGINT NOT NULL AUTO_INCREMENT FIRST,
DROP PRIMARY KEY,
	ADD PRIMARY KEY (`id`) USING BTREE;

CREATE TABLE `obs_annotations_mod_5` (
     `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
     `observer_id` BIGINT(20) NOT NULL,
     `teacher_id` INT(30) NOT NULL,
     `annotation` TEXT NOT NULL DEFAULT '' COLLATE 'utf8_general_ci',
     `description` TEXT NULL DEFAULT '' COLLATE 'utf8_general_ci',
     `period` VARCHAR(1) NOT NULL DEFAULT '' COLLATE 'utf8_general_ci',
     `date_annotation` DATE NULL DEFAULT NULL,
     `state` TINYINT(1) NOT NULL DEFAULT '1',
     `annotation_type` SMALLINT(6) NOT NULL DEFAULT '1',
     `timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
     PRIMARY KEY (`id`) USING BTREE,
     INDEX `observer_id` (`observer_id`) USING BTREE,
     INDEX `teacher_id` (`teacher_id`) USING BTREE,
     INDEX `type_annotation` (`annotation_type`) USING BTREE,
     CONSTRAINT `FK_obs_annotations_mod_5_docentes` FOREIGN KEY (`teacher_id`) REFERENCES `docentes` (`id_docente`) ON UPDATE CASCADE ON DELETE RESTRICT,
     CONSTRAINT `FK_obs_annotations_mod_5_obs_observer_mod_5` FOREIGN KEY (`observer_id`) REFERENCES `obs_observer_mod_5` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
)
    COLLATE='utf8_general_ci'
    ENGINE=InnoDB
    ROW_FORMAT=DYNAMIC
;

