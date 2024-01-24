ALTER TABLE `student_enrollment`
    CHANGE COLUMN `folio` `folio` INT(4) NOT NULL DEFAULT '1' AFTER `id_state`,
    CHANGE COLUMN `registration_number` `registration_number` INT(4) NOT NULL DEFAULT '1' AFTER `folio`,
    CHANGE COLUMN `book` `book` INT(4) NOT NULL DEFAULT '1' AFTER `registration_number`;
