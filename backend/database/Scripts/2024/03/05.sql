ALTER TABLE `tp_polling_stations`
    ADD COLUMN `extra_data` JSON NULL DEFAULT NULL AFTER `closing_time`;

ALTER TABLE `tp_candidates`
    ADD COLUMN `availability_status` SMALLINT(1) NOT NULL DEFAULT '1' AFTER `state`;
