CREATE TABLE "collection_recipes" (
	"collection_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "collection_recipes_collection_id_recipe_id_pk" PRIMARY KEY("collection_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "collection_wines" (
	"collection_id" uuid NOT NULL,
	"wine_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "collection_wines_collection_id_wine_id_pk" PRIMARY KEY("collection_id","wine_id")
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"tips" text[] DEFAULT ARRAY[]::text[],
	"image" varchar(512),
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_slug_unique" UNIQUE("slug")
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
	CONSTRAINT "subscribers_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" varchar(50) DEFAULT 'both' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
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
	"aromas" text[] DEFAULT ARRAY[]::text[],
	"pairings" text[] DEFAULT ARRAY[]::text[],
	"price_range" varchar(20),
	"occasion" varchar(100),
	"image" varchar(512),
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wines_slug_unique" UNIQUE("slug")
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
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
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
ALTER TABLE "collection_recipes" ADD CONSTRAINT "collection_recipes_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_recipes" ADD CONSTRAINT "collection_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_wines" ADD CONSTRAINT "collection_wines_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_wines" ADD CONSTRAINT "collection_wines_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_comments" ADD CONSTRAINT "recipe_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "wine_favorites" ADD CONSTRAINT "wine_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_favorites" ADD CONSTRAINT "wine_favorites_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_tags" ADD CONSTRAINT "wine_tags_wine_id_wines_id_fk" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wine_tags" ADD CONSTRAINT "wine_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_recipes_collection_id_idx" ON "collection_recipes" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_recipes_recipe_id_idx" ON "collection_recipes" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "collection_recipes_sort_idx" ON "collection_recipes" USING btree ("collection_id","sort_order");--> statement-breakpoint
CREATE INDEX "collection_wines_collection_id_idx" ON "collection_wines" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_wines_wine_id_idx" ON "collection_wines" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "collection_wines_sort_idx" ON "collection_wines" USING btree ("collection_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "collections_published_idx" ON "collections" USING btree ("published");--> statement-breakpoint
CREATE INDEX "collections_featured_idx" ON "collections" USING btree ("featured");--> statement-breakpoint
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
CREATE INDEX "recipe_tags_recipe_id_idx" ON "recipe_tags" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_tags_tag_id_idx" ON "recipe_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_wine_pairings_unique_idx" ON "recipe_wine_pairings" USING btree ("recipe_id","wine_id");--> statement-breakpoint
CREATE INDEX "recipe_wine_pairings_recipe_id_idx" ON "recipe_wine_pairings" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_wine_pairings_wine_id_idx" ON "recipe_wine_pairings" USING btree ("wine_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipes_slug_idx" ON "recipes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "recipes_category_idx" ON "recipes" USING btree ("category");--> statement-breakpoint
CREATE INDEX "recipes_difficulty_idx" ON "recipes" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "recipes_published_idx" ON "recipes" USING btree ("published");--> statement-breakpoint
CREATE INDEX "recipes_featured_idx" ON "recipes" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "recipes_created_at_idx" ON "recipes" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "recipes_published_created_idx" ON "recipes" USING btree ("published","created_at" DESC);--> statement-breakpoint
CREATE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "subscribers_active_idx" ON "subscribers" USING btree ("active");--> statement-breakpoint
CREATE INDEX "subscribers_unsubscribe_token_idx" ON "subscribers" USING btree ("unsubscribe_token");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "wine_comments_wine_id_idx" ON "wine_comments" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "wine_comments_user_id_idx" ON "wine_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wine_comments_parent_id_idx" ON "wine_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "wine_comments_created_at_idx" ON "wine_comments" USING btree ("wine_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "wine_favorites_user_id_idx" ON "wine_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wine_favorites_wine_id_idx" ON "wine_favorites" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "wine_tags_wine_id_idx" ON "wine_tags" USING btree ("wine_id");--> statement-breakpoint
CREATE INDEX "wine_tags_tag_id_idx" ON "wine_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wines_slug_idx" ON "wines" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "wines_type_idx" ON "wines" USING btree ("type");--> statement-breakpoint
CREATE INDEX "wines_country_idx" ON "wines" USING btree ("country");--> statement-breakpoint
CREATE INDEX "wines_winery_idx" ON "wines" USING btree ("winery");--> statement-breakpoint
CREATE INDEX "wines_published_idx" ON "wines" USING btree ("published");--> statement-breakpoint
CREATE INDEX "wines_featured_idx" ON "wines" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "wines_rating_idx" ON "wines" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "wines_created_at_idx" ON "wines" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");