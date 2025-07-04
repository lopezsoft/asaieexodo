DROP TABLE IF EXISTS `family_and_users_ids`;
CREATE TABLE `family_and_users_ids` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `family_id` BIGINT(20) NOT NULL,
  `user_id` BIGINT(20) UNSIGNED NOT NULL,
  `profile` ENUM('student', 'family') NOT NULL DEFAULT 'student' COMMENT 'Indica si el usuario es un estudiante o un familiar.',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `family_id` (`family_id`) USING BTREE,
  INDEX `user_id` (`user_id`) USING BTREE,
  INDEX `profile` (`profile`) USING BTREE
)
    COMMENT='Guarda la relación entre el usuario y el estudiante/familiar correspondiente.'
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
;
