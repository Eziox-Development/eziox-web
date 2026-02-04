CREATE TABLE "content_moderation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"content_type" varchar(30) NOT NULL,
	"content_value" text NOT NULL,
	"action" varchar(30) NOT NULL,
	"reason" varchar(100) NOT NULL,
	"matched_pattern" text,
	"severity" varchar(20) DEFAULT 'medium',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_decision" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_fingerprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint_hash" varchar(64) NOT NULL,
	"user_id" uuid NOT NULL,
	"user_agent" text,
	"screen_resolution" varchar(20),
	"timezone" varchar(50),
	"language" varchar(10),
	"platform" varchar(50),
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"ip_hash" varchar(64),
	"user_agent" text,
	"fingerprint_id" uuid,
	"login_method" varchar(30) NOT NULL,
	"success" boolean NOT NULL,
	"failure_reason" varchar(100),
	"country" varchar(2),
	"city" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "multi_account_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_user_id" uuid NOT NULL,
	"linked_user_id" uuid NOT NULL,
	"link_type" varchar(30) NOT NULL,
	"confidence" integer DEFAULT 50 NOT NULL,
	"evidence" jsonb,
	"status" varchar(20) DEFAULT 'detected',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"banned_by" uuid,
	"ban_type" varchar(30) NOT NULL,
	"reason" text NOT NULL,
	"internal_notes" text,
	"expires_at" timestamp,
	"appeal_status" varchar(20) DEFAULT 'none',
	"appeal_message" text,
	"appealed_at" timestamp,
	"appeal_reviewed_by" uuid,
	"appeal_reviewed_at" timestamp,
	"appeal_response" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_moderation_log" ADD CONSTRAINT "content_moderation_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation_log" ADD CONSTRAINT "content_moderation_log_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_fingerprints" ADD CONSTRAINT "device_fingerprints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_fingerprint_id_device_fingerprints_id_fk" FOREIGN KEY ("fingerprint_id") REFERENCES "public"."device_fingerprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_account_links" ADD CONSTRAINT "multi_account_links_primary_user_id_users_id_fk" FOREIGN KEY ("primary_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_account_links" ADD CONSTRAINT "multi_account_links_linked_user_id_users_id_fk" FOREIGN KEY ("linked_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_account_links" ADD CONSTRAINT "multi_account_links_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_banned_by_users_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_appeal_reviewed_by_users_id_fk" FOREIGN KEY ("appeal_reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;