CREATE TABLE "commercial_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_key" varchar(64) NOT NULL,
	"licensee_name" varchar(255) NOT NULL,
	"licensee_email" varchar(255) NOT NULL,
	"licensee_company" varchar(255),
	"license_type" varchar(50) NOT NULL,
	"max_domains" integer DEFAULT 1,
	"max_users" integer,
	"allowed_domains" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"inquiry_id" uuid,
	"issued_by" uuid,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "commercial_licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
CREATE TABLE "compliance_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"detected_domain" varchar(255) NOT NULL,
	"detected_ip" varchar(45),
	"violation_type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"evidence_url" text,
	"evidence_description" text,
	"evidence_screenshot" text,
	"detection_method" varchar(50) NOT NULL,
	"license_id" uuid,
	"status" varchar(30) DEFAULT 'detected' NOT NULL,
	"enforcement_action" varchar(50),
	"enforcement_date" timestamp,
	"enforcement_notes" text,
	"assigned_to" uuid,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"contact_attempts" integer DEFAULT 0,
	"last_contact_at" timestamp,
	"contact_email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid,
	"domain" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"endpoint" varchar(255),
	"request_count" integer DEFAULT 1,
	"is_valid" boolean DEFAULT true,
	"validation_error" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"user_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"details" jsonb,
	"resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"notification_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commercial_licenses" ADD CONSTRAINT "commercial_licenses_inquiry_id_license_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."license_inquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_licenses" ADD CONSTRAINT "commercial_licenses_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_license_id_commercial_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."commercial_licenses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_usage_logs" ADD CONSTRAINT "license_usage_logs_license_id_commercial_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."commercial_licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;