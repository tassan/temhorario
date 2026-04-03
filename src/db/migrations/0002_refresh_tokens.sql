CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "refresh_tokens_tenant_isolation" ON "refresh_tokens" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."id" = "refresh_tokens"."user_id"
        AND current_setting('app.current_tenant_id', true) IS NOT NULL
        AND u."tenant_id" = current_setting('app.current_tenant_id', true)::uuid
    )
  );