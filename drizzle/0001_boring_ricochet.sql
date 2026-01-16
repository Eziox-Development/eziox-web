ALTER TABLE "partner_applications" ADD COLUMN "subcategory" varchar(50);--> statement-breakpoint
ALTER TABLE "partner_applications" ADD COLUMN "category_data" jsonb DEFAULT '{}'::jsonb;