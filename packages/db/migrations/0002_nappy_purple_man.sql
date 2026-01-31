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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "gallery_images_category_idx" ON "gallery_images" USING btree ("category");--> statement-breakpoint
CREATE INDEX "gallery_images_published_idx" ON "gallery_images" USING btree ("published");--> statement-breakpoint
CREATE INDEX "gallery_images_sort_idx" ON "gallery_images" USING btree ("category","sort_order");--> statement-breakpoint
CREATE INDEX "gallery_images_published_category_idx" ON "gallery_images" USING btree ("published","category","sort_order" ASC);