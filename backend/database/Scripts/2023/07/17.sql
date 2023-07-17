ALTER TABLE `inscripciones`
	CHANGE COLUMN `foto` `foto` VARCHAR(250) NULL DEFAULT NULL COLLATE 'utf8_general_ci' AFTER `tipo_sangre`;
