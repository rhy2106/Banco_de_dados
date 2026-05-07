import 'dotenv/config';
import postgres from 'postgres';
import cassandra from 'cassandra-driver';
import neo4j from 'neo4j-driver';

const sql = postgres(process.env.SUPABASE_URL)

const cloud = { secureConnectBundle: './secure-connect-teste.zip' };
const authProvider = new cassandra.auth.PlainTextAuthProvider('token', process.env.ASTRA_TOKEN);
const cql = new cassandra.Client({ cloud, authProvider, keyspace: 'default_keyspace'});

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
export {sql, cql, neo}

