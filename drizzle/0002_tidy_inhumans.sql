CREATE TABLE "spotify_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"scope" text,
	"show_on_profile" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "spotify_connections_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "spotify_connections" ADD CONSTRAINT "spotify_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;