import 'dotenv/config'
import postgres from 'postgres'
import { DataAPIClient } from "@datastax/astra-db-ts";

const sql = postgres(process.env.SUPABASE_URL)

const client = new DataAPIClient();
const cassandra = client.db(
	process.env.ASTRA_URL,
	{token: process.env.ASTRA_TOKEN}
);

export {sql, cassandra}

