ALTER TABLE `asignaturas_certificados`
	ADD CONSTRAINT `FK_asignaturas_certificados_asignaturas` FOREIGN KEY (`id_asig_padre`) REFERENCES `asignaturas` (`id_pk`) ON UPDATE CASCADE ON DELETE RESTRICT;
