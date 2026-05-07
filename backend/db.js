import 'dotenv/config';
import postgres from 'postgres';
import cassandra from 'cassandra-driver';
// import { DataAPIClient } from "@datastax/astra-db-ts";

const sql = postgres(process.env.SUPABASE_URL)

// const client = new DataAPIClient();
// const cassandra = client.db(
// 	process.env.ASTRA_URL,
// 	{token: process.env.ASTRA_TOKEN}
// );

const cloud = { secureConnectBundle: './secure-connect-teste.zip' };
const authProvider = new cassandra.auth.PlainTextAuthProvider('token', process.env.ASTRA_TOKEN);
const cql = new cassandra.Client({ cloud, authProvider, keyspace: 'default_keyspace'});

export {sql, cql}
