ALTER TABLE `obs_observer_mod_5`
	CHANGE COLUMN `det_limit_visual` `det_limit_visual` TEXT NULL COLLATE 'utf8_general_ci' AFTER `barreras_aprendizaje`,
	CHANGE COLUMN `eps_dx_doctor_limit_visual` `eps_dx_doctor_limit_visual` TEXT NULL COLLATE 'utf8_general_ci' AFTER `det_limit_visual`,
	CHANGE COLUMN `det_limit_auditiva` `det_limit_auditiva` TEXT NULL COLLATE 'utf8_general_ci' AFTER `eps_dx_doctor_limit_visual`,
	CHANGE COLUMN `eps_dx_doctor_auditiva` `eps_dx_doctor_auditiva` TEXT NULL COLLATE 'utf8_general_ci' AFTER `det_limit_auditiva`,
	CHANGE COLUMN `det_limit_trans_lenguaje` `det_limit_trans_lenguaje` TEXT NULL COLLATE 'utf8_general_ci' AFTER `eps_dx_doctor_auditiva`,
	CHANGE COLUMN `eps_dx_doctor_trans_lenguaje` `eps_dx_doctor_trans_lenguaje` TEXT NULL COLLATE 'utf8_general_ci' AFTER `det_limit_trans_lenguaje`,
	CHANGE COLUMN `det_limit_motricidad` `det_limit_motricidad` TEXT NULL COLLATE 'utf8_general_ci' AFTER `eps_dx_doctor_trans_lenguaje`,
	CHANGE COLUMN `eps_dx_doctor_motricidad` `eps_dx_doctor_motricidad` TEXT NULL COLLATE 'utf8_general_ci' AFTER `det_limit_motricidad`,
	CHANGE COLUMN `det_limit_otra` `det_limit_otra` TEXT NULL COLLATE 'utf8_general_ci' AFTER `eps_dx_doctor_motricidad`,
	CHANGE COLUMN `eps_dx_doctor_otra` `eps_dx_doctor_otra` TEXT NULL COLLATE 'utf8_general_ci' AFTER `det_limit_otra`;
ALTER TABLE `obs_observer_mod_5`
	CHANGE COLUMN `otra_dificulta_aprendizaje` `otra_dificulta_aprendizaje` VARCHAR(600) NOT NULL DEFAULT 'No' COLLATE 'utf8_general_ci' AFTER `dificultad_aprendizaje`;