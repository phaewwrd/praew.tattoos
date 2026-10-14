CREATE TABLE "portfolio_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "portfolio_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(80) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_category_id_portfolio_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."portfolio_categories"("id") ON DELETE set null ON UPDATE no action;