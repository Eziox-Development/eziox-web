CREATE TABLE "license_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"company" varchar(255),
	"website" varchar(255),
	"phone" varchar(50),
	"license_type" varchar(50) NOT NULL,
	"use_case" text NOT NULL,
	"expected_users" varchar(50),
	"budget" varchar(50),
	"timeline" varchar(50),
	"additional_notes" text,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "takedown_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_name" varchar(255) NOT NULL,
	"requester_email" varchar(255) NOT NULL,
	"requester_company" varchar(255),
	"requester_address" text,
	"requester_phone" varchar(50),
	"content_type" varchar(50) NOT NULL,
	"content_url" text NOT NULL,
	"reported_user_id" uuid,
	"reported_username" varchar(100),
	"claim_type" varchar(50) NOT NULL,
	"original_work_url" text,
	"description" text NOT NULL,
	"good_faith_statement" boolean DEFAULT false,
	"accuracy_statement" boolean DEFAULT false,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal',
	"assigned_to" uuid,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"action_taken" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "failed_payment_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_failed_payment_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "suspended_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "suspension_reason" text;--> statement-breakpoint
ALTER TABLE "license_inquiries" ADD CONSTRAINT "license_inquiries_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takedown_requests" ADD CONSTRAINT "takedown_requests_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takedown_requests" ADD CONSTRAINT "takedown_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takedown_requests" ADD CONSTRAINT "takedown_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;