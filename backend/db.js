import 'dotenv/config'
import postgres from 'postgres'
import { DataAPIClient } from "@datastax/astra-db-ts";
import neo4j from 'neo4j-driver';

const sql = postgres(process.env.SUPABASE_URL)
const client = new DataAPIClient();
const cassandra = client.db(
	process.env.ASTRA_URL,
	{token: process.env.ASTRA_TOKEN}
);

const neo = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(
        process.env.NEO4J_USER,
        process.env.NEO4J_PASSWORD
    )
);
const session = neo.session();
try{
    console.log("Neo4j conectado");
}catch(err){
    console.log(err);
}finally{
    await session.close();
}
export {sql, cassandra, neo}

