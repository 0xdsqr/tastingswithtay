CREATE TABLE "experiment_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_id" uuid NOT NULL,
	"content" text NOT NULL,
	"entry_type" varchar(50) DEFAULT 'update' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	CONSTRAINT "experiments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "experiment_entries" ADD CONSTRAINT "experiment_entries_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_tags" ADD CONSTRAINT "experiment_tags_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_tags" ADD CONSTRAINT "experiment_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experiment_entries_experiment_id_idx" ON "experiment_entries" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "experiment_entries_sort_idx" ON "experiment_entries" USING btree ("experiment_id","sort_order");--> statement-breakpoint
CREATE INDEX "experiment_entries_created_at_idx" ON "experiment_entries" USING btree ("experiment_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "experiment_tags_experiment_id_idx" ON "experiment_tags" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "experiment_tags_tag_id_idx" ON "experiment_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "experiments_slug_idx" ON "experiments" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "experiments_status_idx" ON "experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "experiments_published_idx" ON "experiments" USING btree ("published");--> statement-breakpoint
CREATE INDEX "experiments_featured_idx" ON "experiments" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "experiments_created_at_idx" ON "experiments" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "experiments_published_created_idx" ON "experiments" USING btree ("published","created_at" DESC);