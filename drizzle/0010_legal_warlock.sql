CREATE TABLE "withdrawal_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request_type" varchar(50) NOT NULL,
	"reason" text,
	"subscription_id" varchar(255),
	"payment_intent_id" varchar(255),
	"requested_amount" integer,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"processed_by" uuid,
	"processed_at" timestamp,
	"processing_notes" text,
	"refund_amount" integer,
	"refund_id" varchar(255),
	"confirmation_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;