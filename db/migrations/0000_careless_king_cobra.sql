CREATE TABLE IF NOT EXISTS "addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checklist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checklist_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cleaners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cleaners_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inspection_addons" (
	"inspection_id" integer NOT NULL,
	"addon_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inspection_addons_inspection_id_addon_id_pk" PRIMARY KEY("inspection_id","addon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"cleaner_id" integer NOT NULL,
	"requested_by" integer,
	"date" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"base_price" real DEFAULT 0 NOT NULL,
	"price" real DEFAULT 0 NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"payment_id" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"issues" text,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"type" text NOT NULL,
	"bedrooms" integer DEFAULT 1 NOT NULL,
	"bathrooms" real DEFAULT 1 NOT NULL,
	"health_score" integer,
	"last_health_check" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'host' NOT NULL,
	"email" text,
	"name" text,
	"phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_section_id_checklist_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."checklist_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checklist_sections" ADD CONSTRAINT "checklist_sections_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inspection_addons" ADD CONSTRAINT "inspection_addons_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inspection_addons" ADD CONSTRAINT "inspection_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inspections" ADD CONSTRAINT "inspections_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inspections" ADD CONSTRAINT "inspections_cleaner_id_cleaners_id_fk" FOREIGN KEY ("cleaner_id") REFERENCES "public"."cleaners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inspections" ADD CONSTRAINT "inspections_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
