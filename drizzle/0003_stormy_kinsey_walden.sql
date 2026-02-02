ALTER TABLE "users" ADD COLUMN "pending_email" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_email_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_email_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_email_change_at" timestamp;