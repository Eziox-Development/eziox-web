CREATE TABLE "newsletters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"html_content" text,
	"audience" varchar(30) DEFAULT 'all' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp,
	"sent_by" uuid,
	"recipient_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;