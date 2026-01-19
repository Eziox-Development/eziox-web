ALTER TABLE "profiles" ADD COLUMN "custom_themes" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "active_custom_theme_id" varchar(50);