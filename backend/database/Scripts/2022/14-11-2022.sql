ALTER TABLE `acta_promocion`
    CHANGE COLUMN `id_matric` `id_matric` INT(30) NOT NULL FIRST,
    CHANGE COLUMN `promedio` `promedio` DECIMAL(6,2) NOT NULL DEFAULT '0' AFTER `id_matric`,
    CHANGE COLUMN `promedio_rec` `promedio_rec` DECIMAL(6,2) NOT NULL DEFAULT '0' AFTER `promedio`,
    CHANGE COLUMN `areas_g` `areas_g` SMALLINT NOT NULL DEFAULT 0 AFTER `promedio_rec`,
    CHANGE COLUMN `areas_p` `areas_p` SMALLINT NOT NULL DEFAULT 0 AFTER `areas_g`,
    CHANGE COLUMN `msg` `msg` VARCHAR(250) NULL DEFAULT '' COLLATE 'utf8_general_ci' AFTER `areas_p`,
    CHANGE COLUMN `msg1` `msg1` VARCHAR(250) NULL DEFAULT '' COLLATE 'utf8_general_ci' AFTER `msg`,
    CHANGE COLUMN `msg2` `msg2` VARCHAR(250) NULL DEFAULT '' COLLATE 'utf8_general_ci' AFTER `msg1`,
    CHANGE COLUMN `msg3` `msg3` TEXT NULL COLLATE 'utf8_general_ci' AFTER `msg2`,
    CHANGE COLUMN `estado` `estado` SMALLINT NOT NULL DEFAULT 1 AFTER `msg3`,
    CHANGE COLUMN `prom_comision` `prom_comision` SMALLINT NOT NULL DEFAULT 0 AFTER `estado`,
    CHANGE COLUMN `libro` `libro` SMALLINT NOT NULL DEFAULT 0 AFTER `prom_comision`,
    CHANGE COLUMN `folio` `folio` SMALLINT NOT NULL DEFAULT 0 AFTER `libro`;


ALTER TABLE `config_const_cert_end`
    ADD COLUMN `show_number_message` VARCHAR(120) NULL DEFAULT 'CONSTANCIA Nº' AFTER `show_number`;

