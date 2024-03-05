ALTER TABLE `tp_polling_stations`
    ADD COLUMN `extra_dara` JSON NULL DEFAULT NULL AFTER `closing_time`;
