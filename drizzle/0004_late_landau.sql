CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"tier" varchar(20) NOT NULL,
	"status" varchar(50) NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"ended_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "tier" SET DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "notify_new_follower" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "notify_milestones" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "notify_system_updates" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_seen_changelog" varchar(20);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "custom_background" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "layout_settings" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_backups" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "theme_id" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "custom_css" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "custom_fonts" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "animated_profile" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "open_graph_settings" jsonb;--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "featured_style" varchar(20);--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "schedule" jsonb;--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "ab_test_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "ab_test_variants" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "utm_source" varchar(100);--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "utm_medium" varchar(100);--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "utm_campaign" varchar(100);--> statement-breakpoint
ALTER TABLE "user_links" ADD COLUMN "embed_settings" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;