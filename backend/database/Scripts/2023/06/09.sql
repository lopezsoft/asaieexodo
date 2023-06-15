CREATE TABLE `teachers_and_users_ids` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	`teacher_id` BIGINT NOT NULL,
	`user_id` BIGINT UNSIGNED NOT NULL,
	PRIMARY KEY (`id`),
	INDEX `teacher_id` (`teacher_id`),
	INDEX `user_id` (`user_id`)
)
COMMENT='Guarda la relacion entre el usuario y el docente correspondiente.'
COLLATE='utf8mb4_general_ci'
;
