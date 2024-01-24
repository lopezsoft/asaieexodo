ALTER TABLE `asignaturas_certificados`
    ADD COLUMN `year` YEAR NOT NULL DEFAULT '0' AFTER `ih`;

ALTER TABLE `asignaturas`
    ADD COLUMN `type` SMALLINT(1) NOT NULL DEFAULT 1 AFTER `estado`;

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
DROP TABLE `asignaturas_certificados`;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

CREATE TABLE `subject_certificates` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `subject_parent_id` INT(11) NOT NULL,
    `subject_related_id` INT(11) NOT NULL,
    `ih` DECIMAL(4,2) NOT NULL DEFAULT '1.00',
    `year` YEAR NOT NULL DEFAULT '2000',
    `state` SMALLINT(1) NOT NULL DEFAULT '1',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `subject_parent_id_subject_related_id` (`subject_parent_id`, `subject_related_id`) USING BTREE,
    INDEX `id_asig_padre` (`subject_parent_id`) USING BTREE,
    INDEX `subject_related_id` (`subject_related_id`) USING BTREE,
    CONSTRAINT `FK_subject_certificates_asignaturas` FOREIGN KEY (`subject_parent_id`) REFERENCES `asignaturas` (`id_pk`) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `FK_subject_certificates_asignaturas_2` FOREIGN KEY (`subject_related_id`) REFERENCES `asignaturas` (`id_pk`) ON UPDATE CASCADE ON DELETE RESTRICT
    )
    COLLATE='utf8_general_ci'
ENGINE=InnoDB
;

-- Path: database/Scripts/2023/11/16.sql
