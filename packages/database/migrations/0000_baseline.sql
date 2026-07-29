CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(100) NOT NULL,
	"target_id" varchar(256) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_recipes" (
	"collection_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "collection_recipes_collection_id_recipe_id_pk" PRIMARY KEY("collection_id","recipe_id"),
	CONSTRAINT "collection_recipes_sort_order_check" CHECK ("collection_recipes"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "collection_wines" (
	"collection_id" uuid NOT NULL,
	"wine_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "collection_wines_collection_id_wine_id_pk" PRIMARY KEY("collection_id","wine_id"),
	CONSTRAINT "collection_wines_sort_order_check" CHECK ("collection_wines"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"image" varchar(512),
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "experiment_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_id" uuid NOT NULL,
	"content" text NOT NULL,
	"entry_type" varchar(50) DEFAULT 'update' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiment_entries_type_check" CHECK ("experiment_entries"."entry_type" IN ('update', 'photo', 'note', 'result', 'iteration')),
	CONSTRAINT "experiment_entries_sort_order_check" CHECK ("experiment_entries"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "experiment_tags" (
	"experiment_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "experiment_tags_experiment_id_tag_id_pk" PRIMARY KEY("experiment_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(50) DEFAULT 'in_progress' NOT NULL,
	"hypothesis" text,
	"result" text,
	"recipe_id" uuid,
	"image" varchar(512),
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiments_slug_unique" UNIQUE("slug"),
	CONSTRAINT "experiments_status_check" CHECK ("experiments"."status" IN ('in_progress', 'paused', 'completed', 'graduated'))
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256),
	"caption" text,
	"image" varchar(512) NOT NULL,
	"category" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"taken_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_images_category_check" CHECK ("gallery_images"."category" IN ('garden', 'flock')),
	CONSTRAINT "gallery_images_sort_order_check" CHECK ("gallery_images"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	CONSTRAINT "rate_limit_buckets_count_check" CHECK ("rate_limit_buckets"."count" > 0)
);
--> statement-breakpoint
CREATE TABLE "recipe_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_favorites" (
	"user_id" text NOT NULL,
	"recipe_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_favorites_user_id_recipe_id_pk" PRIMARY KEY("user_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_ratings_rating_check" CHECK ("recipe_ratings"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "recipe_tags" (
	"recipe_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "recipe_tags_recipe_id_tag_id_pk" PRIMARY KEY("recipe_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_wine_pairings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"wine_id" uuid NOT NULL,
	"notes" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"prep_time" integer,
	"cook_time" integer,
	"servings" integer,
	"ingredients" jsonb NOT NULL,
	"instructions" jsonb NOT NULL,
	"tips" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"image" varchar(512),
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_slug_unique" UNIQUE("slug"),
	CONSTRAINT "recipes_difficulty_check" CHECK ("recipes"."difficulty" IN ('Easy', 'Medium', 'Hard')),
	CONSTRAINT "recipes_prep_time_check" CHECK ("recipes"."prep_time" IS NULL OR "recipes"."prep_time" > 0),
	CONSTRAINT "recipes_cook_time_check" CHECK ("recipes"."cook_time" IS NULL OR "recipes"."cook_time" > 0),
	CONSTRAINT "recipes_servings_check" CHECK ("recipes"."servings" IS NULL OR "recipes"."servings" > 0),
	CONSTRAINT "recipes_view_count_check" CHECK ("recipes"."view_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_value_object_check" CHECK (jsonb_typeof("site_settings"."value") = 'object')
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"unsubscribe_token" varchar(128) DEFAULT gen_random_uuid()::text NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "subscribers_unsubscribe_token_unique" UNIQUE("unsubscribe_token"),
	CONSTRAINT "subscribers_email_normalized_check" CHECK ("subscribers"."email" = lower("subscribers"."email"))
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" varchar(50) DEFAULT 'both' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tags_type_check" CHECK ("tags"."type" IN ('recipe', 'wine', 'experiment', 'both'))
);
--> statement-breakpoint
CREATE TABLE "wine_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wine_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wine_favorites" (
	"user_id" text NOT NULL,
	"wine_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wine_favorites_user_id_wine_id_pk" PRIMARY KEY("user_id","wine_id")
);
--> statement-breakpoint
CREATE TABLE "wine_tags" (
	"wine_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "wine_tags_wine_id_tag_id_pk" PRIMARY KEY("wine_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "wines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"winery" varchar(256) NOT NULL,
	"region" varchar(256),
	"country" varchar(100),
	"vintage" integer,
	"type" varchar(50) NOT NULL,
	"grapes" varchar(256),
	"rating" integer,
	"notes" text,
	"aromas" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"pairings" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"price_range" varchar(20),
	"occasion" varchar(100),
	"image" varchar(512),
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wines_slug_unique" UNIQUE("slug"),
	CONSTRAINT "wines_type_check" CHECK ("wines"."type" IN ('Red', 'White', 'Rosé', 'Sparkling', 'Dessert')),
	CONSTRAINT "wines_vintage_check" CHECK ("wines"."vintage" IS NULL OR "wines"."vintage" BETWEEN 1800 AND 2200),
	CONSTRAINT "wines_rating_check" CHECK ("wines"."rating" IS NULL OR "wines"."rating" BETWEEN 1 AND 5),
	CONSTRAINT "wines_price_range_check" CHECK ("wines"."price_range" IS NULL OR "wines"."price_range" IN ('$', '$$', '$$$', '$$$$', '$$$$$'))
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rateLimit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"lastRequest" bigint NOT NULL,
	CONSTRAINT "rateLimit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_recipes" ADD CONSTRAINT "collection_recipes_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_recipes" ADD CONSTRAINT "collection_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_wines" ADD CONSTRAINT "collection_wines_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_wines" ADD CONSTRAINT "collection_wines_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_entries" ADD CONSTRAINT "experiment_entries_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_tags" ADD CONSTRAINT "experiment_tags_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_tags" ADD CONSTRAINT "experiment_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipe_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ratings" ADD CONSTRAINT "recipe_ratings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ratings" ADD CONSTRAINT "recipe_ratings_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_wine_pairings" ADD CONSTRAINT "recipe_wine_pairings_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_wine_pairings" ADD CONSTRAINT "recipe_wine_pairings_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_comments" ADD CONSTRAINT "wine_comments_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_comments" ADD CONSTRAINT "wine_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_comments" ADD CONSTRAINT "wine_comments_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wine_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_favorites" ADD CONSTRAINT "wine_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_favorites" ADD CONSTRAINT "wine_favorites_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_tags" ADD CONSTRAINT "wine_tags_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_tags" ADD CONSTRAINT "wine_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_log_actor_created_idx" ON "admin_audit_log" USING btree ("actor_user_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "admin_audit_log_target_idx" ON "admin_audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "collection_recipes_collection_id_idx" ON "collection_recipes" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_recipes_recipe_id_idx" ON "collection_recipes" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "collection_recipes_sort_idx" ON "collection_recipes" USING btree ("collection_id","sort_order");--> statement-breakpoint
CREATE INDEX "collection_wines_collection_id_idx" ON "collection_wines" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_wines_wine_id_idx" ON "collection_wines" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "collection_wines_sort_idx" ON "collection_wines" USING btree ("collection_id","sort_order");--> statement-breakpoint
CREATE INDEX "collections_published_idx" ON "collections" USING btree ("published");--> statement-breakpoint
CREATE INDEX "collections_featured_idx" ON "collections" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "experiment_entries_experiment_id_idx" ON "experiment_entries" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "experiment_entries_sort_idx" ON "experiment_entries" USING btree ("experiment_id","sort_order");--> statement-breakpoint
CREATE INDEX "experiment_entries_created_at_idx" ON "experiment_entries" USING btree ("experiment_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "experiment_tags_experiment_id_idx" ON "experiment_tags" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "experiment_tags_tag_id_idx" ON "experiment_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "experiments_status_idx" ON "experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "experiments_published_idx" ON "experiments" USING btree ("published");--> statement-breakpoint
CREATE INDEX "experiments_featured_idx" ON "experiments" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "experiments_created_at_idx" ON "experiments" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "experiments_published_created_idx" ON "experiments" USING btree ("published","created_at" DESC);--> statement-breakpoint
CREATE INDEX "gallery_images_category_idx" ON "gallery_images" USING btree ("category");--> statement-breakpoint
CREATE INDEX "gallery_images_published_idx" ON "gallery_images" USING btree ("published");--> statement-breakpoint
CREATE INDEX "gallery_images_sort_idx" ON "gallery_images" USING btree ("category","sort_order");--> statement-breakpoint
CREATE INDEX "gallery_images_published_category_idx" ON "gallery_images" USING btree ("published","category","sort_order" ASC);--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "recipe_comments_recipe_id_idx" ON "recipe_comments" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_comments_user_id_idx" ON "recipe_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recipe_comments_parent_id_idx" ON "recipe_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "recipe_comments_created_at_idx" ON "recipe_comments" USING btree ("recipe_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "recipe_favorites_user_id_idx" ON "recipe_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recipe_favorites_recipe_id_idx" ON "recipe_favorites" USING btree ("recipe_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_ratings_user_recipe_idx" ON "recipe_ratings" USING btree ("user_id","recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_ratings_user_id_idx" ON "recipe_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recipe_ratings_recipe_id_idx" ON "recipe_ratings" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_ratings_rating_idx" ON "recipe_ratings" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "recipe_ratings_recipe_created_idx" ON "recipe_ratings" USING btree ("recipe_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "recipe_tags_recipe_id_idx" ON "recipe_tags" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_tags_tag_id_idx" ON "recipe_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_wine_pairings_unique_idx" ON "recipe_wine_pairings" USING btree ("recipe_id","wine_id");--> statement-breakpoint
CREATE INDEX "recipe_wine_pairings_recipe_id_idx" ON "recipe_wine_pairings" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_wine_pairings_wine_id_idx" ON "recipe_wine_pairings" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "recipes_category_idx" ON "recipes" USING btree ("category");--> statement-breakpoint
CREATE INDEX "recipes_difficulty_idx" ON "recipes" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "recipes_published_idx" ON "recipes" USING btree ("published");--> statement-breakpoint
CREATE INDEX "recipes_featured_idx" ON "recipes" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "recipes_created_at_idx" ON "recipes" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "recipes_published_created_idx" ON "recipes" USING btree ("published","created_at" DESC);--> statement-breakpoint
CREATE INDEX "subscribers_active_idx" ON "subscribers" USING btree ("active");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "wine_comments_wine_id_idx" ON "wine_comments" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "wine_comments_user_id_idx" ON "wine_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wine_comments_parent_id_idx" ON "wine_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "wine_comments_created_at_idx" ON "wine_comments" USING btree ("wine_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "wine_favorites_user_id_idx" ON "wine_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wine_favorites_wine_id_idx" ON "wine_favorites" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "wine_tags_wine_id_idx" ON "wine_tags" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "wine_tags_tag_id_idx" ON "wine_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "wines_type_idx" ON "wines" USING btree ("type");--> statement-breakpoint
CREATE INDEX "wines_country_idx" ON "wines" USING btree ("country");--> statement-breakpoint
CREATE INDEX "wines_winery_idx" ON "wines" USING btree ("winery");--> statement-breakpoint
CREATE INDEX "wines_published_idx" ON "wines" USING btree ("published");--> statement-breakpoint
CREATE INDEX "wines_featured_idx" ON "wines" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "wines_rating_idx" ON "wines" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "wines_created_at_idx" ON "wines" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "wines_published_created_idx" ON "wines" USING btree ("published","created_at" DESC);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rateLimit_key_idx" ON "rateLimit" USING btree ("key");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");