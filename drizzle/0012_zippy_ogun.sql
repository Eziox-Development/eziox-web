CREATE TABLE "status_incident_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" varchar(30) NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"severity" varchar(20) NOT NULL,
	"status" varchar(30) DEFAULT 'investigating' NOT NULL,
	"affected_services" jsonb DEFAULT '[]'::jsonb,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"notification_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"notify_all" boolean DEFAULT true,
	"notify_major" boolean DEFAULT true,
	"notify_critical" boolean DEFAULT true,
	"notify_resolved" boolean DEFAULT true,
	"verified" boolean DEFAULT false,
	"verification_token" varchar(64),
	"unsubscribe_token" varchar(64) NOT NULL,
	"unsubscribed_at" timestamp,
	"subscribed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email_status_alerts" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "status_incident_updates" ADD CONSTRAINT "status_incident_updates_incident_id_status_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."status_incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_incident_updates" ADD CONSTRAINT "status_incident_updates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_incidents" ADD CONSTRAINT "status_incidents_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_subscriptions" ADD CONSTRAINT "status_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;