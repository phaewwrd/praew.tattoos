CREATE TABLE "schedule_date_blocks" (
	"artist_id" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "schedule_date_blocks_artist_date_unique" UNIQUE("artist_id","date")
);
--> statement-breakpoint
ALTER TABLE "schedule_date_blocks" ADD CONSTRAINT "schedule_date_blocks_artist_id_tattoo_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."tattoo_artists"("id") ON DELETE cascade ON UPDATE no action;