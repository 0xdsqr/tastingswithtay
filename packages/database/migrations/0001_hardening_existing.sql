-- Compatibility hardening for databases created before migrations were introduced.
-- Constraints are added NOT VALID so existing production data does not make the
-- deployment fail; PostgreSQL still enforces them for all new and changed rows.

CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets" ("reset_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rateLimit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL UNIQUE,
	"count" integer NOT NULL,
	"lastRequest" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rateLimit_key_idx" ON "rateLimit" ("key");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(100) NOT NULL,
	"target_id" varchar(256) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_log_actor_created_idx" ON "admin_audit_log" ("actor_user_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_audit_log_target_idx" ON "admin_audit_log" ("target_type", "target_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipes_published_created_idx" ON "recipes" ("published", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wines_published_created_idx" ON "wines" ("published", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_ratings_recipe_created_idx" ON "recipe_ratings" ("recipe_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gallery_images_published_category_idx" ON "gallery_images" ("published", "category", "sort_order" ASC);
--> statement-breakpoint
UPDATE "recipes" SET "tips" = ARRAY[]::text[] WHERE "tips" IS NULL;
--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "tips" SET DEFAULT ARRAY[]::text[], ALTER COLUMN "tips" SET NOT NULL;
--> statement-breakpoint
UPDATE "wines" SET "aromas" = ARRAY[]::text[] WHERE "aromas" IS NULL;
--> statement-breakpoint
UPDATE "wines" SET "pairings" = ARRAY[]::text[] WHERE "pairings" IS NULL;
--> statement-breakpoint
ALTER TABLE "wines" ALTER COLUMN "aromas" SET DEFAULT ARRAY[]::text[], ALTER COLUMN "aromas" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "wines" ALTER COLUMN "pairings" SET DEFAULT ARRAY[]::text[], ALTER COLUMN "pairings" SET NOT NULL;
--> statement-breakpoint
UPDATE "experiment_entries" SET "images" = '[]'::jsonb WHERE "images" IS NULL;
--> statement-breakpoint
ALTER TABLE "experiment_entries" ALTER COLUMN "images" SET DEFAULT '[]'::jsonb, ALTER COLUMN "images" SET NOT NULL;
--> statement-breakpoint
DO $migration$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rate_limit_buckets_count_check') THEN
		ALTER TABLE "rate_limit_buckets" ADD CONSTRAINT "rate_limit_buckets_count_check" CHECK ("count" > 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_value_object_check') THEN
		ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_value_object_check" CHECK (jsonb_typeof("value") = 'object') NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tags_type_check') THEN
		ALTER TABLE "tags" ADD CONSTRAINT "tags_type_check" CHECK ("type" IN ('recipe', 'wine', 'experiment', 'both')) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_difficulty_check') THEN
		ALTER TABLE "recipes" ADD CONSTRAINT "recipes_difficulty_check" CHECK ("difficulty" IN ('Easy', 'Medium', 'Hard')) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_prep_time_check') THEN
		ALTER TABLE "recipes" ADD CONSTRAINT "recipes_prep_time_check" CHECK ("prep_time" IS NULL OR "prep_time" > 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_cook_time_check') THEN
		ALTER TABLE "recipes" ADD CONSTRAINT "recipes_cook_time_check" CHECK ("cook_time" IS NULL OR "cook_time" > 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_servings_check') THEN
		ALTER TABLE "recipes" ADD CONSTRAINT "recipes_servings_check" CHECK ("servings" IS NULL OR "servings" > 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipes_view_count_check') THEN
		ALTER TABLE "recipes" ADD CONSTRAINT "recipes_view_count_check" CHECK ("view_count" >= 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wines_type_check') THEN
		ALTER TABLE "wines" ADD CONSTRAINT "wines_type_check" CHECK ("type" IN ('Red', 'White', 'Rosé', 'Sparkling', 'Dessert')) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wines_vintage_check') THEN
		ALTER TABLE "wines" ADD CONSTRAINT "wines_vintage_check" CHECK ("vintage" IS NULL OR "vintage" BETWEEN 1800 AND 2200) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wines_rating_check') THEN
		ALTER TABLE "wines" ADD CONSTRAINT "wines_rating_check" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wines_price_range_check') THEN
		ALTER TABLE "wines" ADD CONSTRAINT "wines_price_range_check" CHECK ("price_range" IS NULL OR "price_range" IN ('$', '$$', '$$$', '$$$$', '$$$$$')) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipe_ratings_rating_check') THEN
		ALTER TABLE "recipe_ratings" ADD CONSTRAINT "recipe_ratings_rating_check" CHECK ("rating" BETWEEN 1 AND 5) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collection_recipes_sort_order_check') THEN
		ALTER TABLE "collection_recipes" ADD CONSTRAINT "collection_recipes_sort_order_check" CHECK ("sort_order" >= 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'collection_wines_sort_order_check') THEN
		ALTER TABLE "collection_wines" ADD CONSTRAINT "collection_wines_sort_order_check" CHECK ("sort_order" >= 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_email_normalized_check') THEN
		ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_email_normalized_check" CHECK ("email" = lower("email")) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recipe_comments_parent_id_fk') THEN
		ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "recipe_comments"("id") ON DELETE CASCADE NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wine_comments_parent_id_fk') THEN
		ALTER TABLE "wine_comments" ADD CONSTRAINT "wine_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "wine_comments"("id") ON DELETE CASCADE NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'experiments_status_check') THEN
		ALTER TABLE "experiments" ADD CONSTRAINT "experiments_status_check" CHECK ("status" IN ('in_progress', 'paused', 'completed', 'graduated')) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'experiment_entries_type_check') THEN
		ALTER TABLE "experiment_entries" ADD CONSTRAINT "experiment_entries_type_check" CHECK ("entry_type" IN ('update', 'photo', 'note', 'result', 'iteration')) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'experiment_entries_sort_order_check') THEN
		ALTER TABLE "experiment_entries" ADD CONSTRAINT "experiment_entries_sort_order_check" CHECK ("sort_order" >= 0) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_images_category_check') THEN
		ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_category_check" CHECK ("category" IN ('garden', 'flock')) NOT VALID;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_images_sort_order_check') THEN
		ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_sort_order_check" CHECK ("sort_order" >= 0) NOT VALID;
	END IF;
END $migration$;
