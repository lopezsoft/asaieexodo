
CREATE TABLE `obs_observer_mod_5` (
    `id` INT(20) NOT NULL AUTO_INCREMENT,
    `id_matric` INT(30) NOT NULL,
    `year` YEAR NOT NULL,
    `peso` VARCHAR(30) NOT NULL COLLATE 'utf8_general_ci',
    `talla` VARCHAR(30) NOT NULL COLLATE 'utf8_general_ci',
    `religion` VARCHAR(60) NOT NULL COLLATE 'utf8_general_ci',
    `deporte` VARCHAR(60) NOT NULL COLLATE 'utf8_general_ci',
    `trabaja` VARCHAR(4) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci',
    `prof_oficio` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `barreras_aprendizaje` VARCHAR(4) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci',
    `det_limit_visual` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `eps_dx_doctor_limit_visual` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `det_limit_auditiva` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `eps_dx_doctor_auditiva` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `det_limit_trans_lenguaje` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `eps_dx_doctor_trans_lenguaje` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `det_limit_motricidad` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `eps_dx_doctor_motricidad` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `det_limit_otra` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `eps_dx_doctor_otra` VARCHAR(120) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `dificultad_aprendizaje` VARCHAR(4) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci',
    `otra_dificulta_aprendizaje` VARCHAR(80) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci',
    `dislexia` VARCHAR(60) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `disgrafia` VARCHAR(60) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `discalculia` VARCHAR(60) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `disc_intelectual` VARCHAR(60) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `disc_memoria_auditivo` VARCHAR(60) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `tea` VARCHAR(60) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `tdha` VARCHAR(60) NULL DEFAULT NULL COLLATE 'utf8_general_ci',
    `num_hermanos` SMALLINT(6) NOT NULL DEFAULT '0',
    `lugar_hermanos` SMALLINT(6) NOT NULL DEFAULT '0',
    `num_hermanos_hombres` SMALLINT(6) NOT NULL DEFAULT '0',
    `num_hermanos_mujeres` SMALLINT(6) NOT NULL DEFAULT '0',
    `madre_cabeza_hogar` VARCHAR(4) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci',
    `padre_cabeza_hogar` VARCHAR(4) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci',
    `desplazados` VARCHAR(4) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci',
    `fecha` DATE NULL DEFAULT NULL,
    `estado` TINYINT(1) NOT NULL DEFAULT '1',
    `timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `id_matric` (`id_matric`) USING BTREE,
    CONSTRAINT `obs_observer_mod_5_ibfk_1` FOREIGN KEY (`id_matric`) REFERENCES `student_enrollment` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
)
    COMMENT='Modelo  de la ficha del estudiante por FRANJOCAL'
COLLATE='utf8_general_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
;


