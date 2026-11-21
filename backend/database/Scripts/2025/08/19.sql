ALTER TABLE `obs_modelos_observador_cuerpo`
    CHANGE COLUMN `foto` `foto` TEXT NULL DEFAULT NULL AFTER `id_observador`,
    CHANGE COLUMN `mime` `mime` VARCHAR(30) NULL DEFAULT 'image/jpeg' COLLATE 'utf8_general_ci' AFTER `foto`,
    CHANGE COLUMN `encabezado` `encabezado` TEXT NULL DEFAULT NULL COLLATE 'utf8_general_ci' AFTER `mime`,
    CHANGE COLUMN `cuerpo` `cuerpo` TEXT NULL DEFAULT NULL COLLATE 'utf8_general_ci' AFTER `encabezado`;
