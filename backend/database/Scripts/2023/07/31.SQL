ALTER TABLE `file_managers`
	CHANGE COLUMN `profile` `profile` ENUM('TEACHER','STUDENT','ADMIN','FAMILY','ANY','SCHOOL','USER','SIGNATURE','CERTIFICATE') NOT NULL DEFAULT 'ANY' COLLATE 'utf8mb4_general_ci' AFTER `belong_to_id`;

ALTER TABLE `config_const_cert`
	ADD COLUMN `show_number_message` VARCHAR(150) NULL DEFAULT 'CONSTANCIA Nº.' AFTER `show_number`;
