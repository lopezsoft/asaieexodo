ALTER TABLE `aux_families_students`
    ADD COLUMN `live_with_this` TINYINT NOT NULL DEFAULT 0 AFTER `id_relationship`;
