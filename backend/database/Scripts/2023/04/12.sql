ALTER TABLE `administrativos`
	CHANGE COLUMN `tipo_sangr` `tipo_sangre` VARCHAR(3) NOT NULL COLLATE 'utf8_general_ci' AFTER `nombre2`;
