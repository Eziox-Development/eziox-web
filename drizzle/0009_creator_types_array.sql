CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"responded_at" timestamp,
	"responded_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link_click_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"country" varchar(2),
	"city" varchar(100),
	"region" varchar(100),
	"device" varchar(20),
	"browser" varchar(50),
	"os" varchar(50),
	"referrer" text,
	"user_agent" text,
	"ip_hash" varchar(64),
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Convert creator_type (varchar) to creator_types (jsonb array)
-- First add the new column
ALTER TABLE "profiles" ADD COLUMN "creator_types" jsonb DEFAULT '[]'::jsonb;
-- Migrate existing data: convert single value to array
UPDATE "profiles" SET "creator_types" = 
  CASE 
    WHEN "creator_type" IS NOT NULL AND "creator_type" != '' 
    THEN jsonb_build_array("creator_type")
    ELSE '[]'::jsonb
  END;
-- Drop the old column
ALTER TABLE "profiles" DROP COLUMN "creator_type";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_login_alerts" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_security_alerts" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_weekly_digest" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_product_updates" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_recovery_codes" text;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_click_analytics" ADD CONSTRAINT "link_click_analytics_link_id_user_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."user_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_click_analytics" ADD CONSTRAINT "link_click_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;