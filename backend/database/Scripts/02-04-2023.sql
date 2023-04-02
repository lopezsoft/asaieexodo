ALTER TABLE `consolidado_docentes`
	ADD COLUMN `t` INT(11) NOT NULL DEFAULT '0' AFTER `prom`,
	ADD PRIMARY KEY (`id_docente`, `periodo`, `id_matric`);

ALTER TABLE `consolidado_areas`
	ADD PRIMARY KEY (`periodo`, `id_matric`);
