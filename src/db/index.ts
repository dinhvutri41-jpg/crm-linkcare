import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let client: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
	if (!client) {
		const connectionString = process.env.CRM_DATABASE_URL;
		if (!connectionString) throw new Error("CRM_DATABASE_URL is required");
		client = drizzle(neon(connectionString), { schema });
	}
	return client;
}
