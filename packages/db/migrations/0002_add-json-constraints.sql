-- Keep compatibility with legacy rows while enforcing the shape for new writes.
DO $migration$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_audit_log_metadata_object_check') THEN
		ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_metadata_object_check" CHECK (jsonb_typeof("metadata") = 'object') NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'experiment_entries_images_array_check') THEN
		ALTER TABLE "experiment_entries" ADD CONSTRAINT "experiment_entries_images_array_check" CHECK (jsonb_typeof("images") = 'array') NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_ingredients_array_check') THEN
		ALTER TABLE "recipes" ADD CONSTRAINT "recipes_ingredients_array_check" CHECK (jsonb_typeof("ingredients") = 'array') NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_instructions_array_check') THEN
		ALTER TABLE "recipes" ADD CONSTRAINT "recipes_instructions_array_check" CHECK (jsonb_typeof("instructions") = 'array') NOT VALID;
	END IF;
END $migration$;
