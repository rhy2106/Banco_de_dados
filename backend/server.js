import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import path from 'path';
import {sql, cassandra, neo} from './db.js';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
	secret: "um4Str1ng4l34t0r14",
	resave: false,
	saveUninitialized: false
}));

var server = http.createServer(app);
const PORT = 3000;
const startTime = Date.now();

app.get('/',async (req,res)=>{
	res.sendFile(path.resolve('../frontend/view/index.html'),{});
});
app.get('/home',async (req,res)=>{
	res.sendFile(path.resolve('../frontend/view/index.html'),{});
});
app.get('/signin',async (req,res)=>{
	res.sendFile(path.resolve('../frontend/view/cadastro.html'),{});
});
app.get('/login',async (req,res)=>{
	res.sendFile(path.resolve('../frontend/view/login.html'),{});
});
app.get('/fila',async (req,res)=>{
	if(!req.session.uid) res.redirect('/login');
	else res.sendFile(path.resolve('../frontend/view/cadastro_livro.html'),{});
});
app.get('/historico',async (req,res)=>{
	if(!req.session.uid) res.redirect('/login');
	else res.sendFile(path.resolve('../frontend/view/cadastro_livro.html'),{});
});
app.get('/cadastro',async (req,res)=>{
	if(!req.session.uid) res.redirect('/login');
	else if(req.session.adm) res.sendFile(path.resolve('../frontend/view/cadastro_livro.html'),{});
	else res.status(500).json({success:false, mensagem: "Acesso não autorizado"});
});
app.get('/usuarios',async (req,res)=>{
	if(!req.session.uid) res.redirect('/login');
	else if(req.session.adm) res.sendFile(path.resolve('../frontend/view/usuarios.html'),{});
	else res.status(500).json({success:false, mensagem: "Acesso não autorizado"});
});
app.get('/emprestar',async (req,res)=>{
	if(!req.session.uid) res.redirect('/login');
	else if(req.session.adm) res.sendFile(path.resolve('../frontend/view/emprestar.html'),{});
	else res.status(500).json({success:false, mensagem: "Acesso não autorizado"});
});
app.get('/recomendados',async (req,res)=>{
	if(!req.session.uid) res.redirect('/login');
	else if(req.session.adm) res.sendFile(path.resolve('../frontend/view/recomendados.html'),{});
});

app.get('/session',(req,res) =>{
	if(req.session.uid == null)
		return res.json({login:false});
	else{
		res.json({
			login:true, 
			user:{
				uid:req.session.uid,
				usuario:req.session.usuario,
				email:req.session.email,
				genero:req.session.genero,
				adm:req.session.adm 
			}
		});
	}
});

app.get('/logout', (req,res)=>{
	req.session.uid = undefined;
	req.session.email = undefined;
	req.session.usuario = undefined;
	req.session.genero = undefined;
	req.session.adm = undefined;
	req.session.save(()=>{
		res.redirect('/home');
	});
});

app.get('/livro', (req,res)=>{
	res.sendFile(path.resolve('../frontend/view/livro.html'));
});

// SQL

app.post('/livro', async (req,res)=>{
	const lid = req.body.lid;
	try{
		const result = await sql`
			SELECT *
			FROM "Livros"
			WHERE "LID" = ${lid}
		`
		res.json({livro:result[0]});
	} catch(err){
		return res.status(500).json({success: false, mensagem: err.message});
	}
});

app.post('/login', async (req,res) => {
	const {email, senha} = req.body;
	console.log(email,senha);
	try{
		const result = await sql`
			SELECT *
			FROM "Usuarios"
			WHERE email = ${email}
		`
		if(result.length === 0 || result[0].senha != senha)
			return res.status(401).json({success:false, mensagem: "Usuario não encontrado"});
		else{
			console.log(result[0]);
			req.session.uid = result[0].UID;
			req.session.email = result[0].email;
			req.session.usuario = result[0].usuario;
			req.session.genero = result[0].genero;
			req.session.adm = result[0].adm;
			req.session.save(()=>{
				res.json({ success: true});
			});
		}
	} catch(err){
		return res.status(500).json({success: false, mensagem: err.message});
	}
});

app.post('/cadastrar',async (req,res) => {

	const { usuario, email, senha, genero } = req.body;

	let session;

	try{

		const result = await sql`
			INSERT INTO "Usuarios" (
				usuario,
				email,
				senha,
				genero
			)
			VALUES (
				${usuario},
				${email},
				${senha},
				${genero}
			)
			RETURNING "UID"
		`;

		const uid = result[0].UID;

		session = neo.session();

		await session.run(`
			MERGE (u:Usuario {uid: $uid})

			SET u.usuario = $usuario,
				u.email = $email,
				u.genero = $genero
		`,{
			uid,
			usuario,
			email,
			genero
		});

		res.json({
			success:true
		});

	}catch(err){

		console.log(err);

		if(err.code === '23505'){

			res.status(400).json({
				success: false,
				mensagem: 'Email já cadastrado!'
			});

		}else{

			res.status(500).json({
				success: false,
				mensagem: err.message
			});
		}

	}finally{

		if(session){
			await session.close();
		}
	}
});

app.post('/pesquisa',async (req,res) => {
	const { texto } = req.body;
	console.log(texto);
	try{
		let result;
		result = await sql`
			SELECT
				"Livros"."LID" AS "LID",
				"Livros".nome AS nome,
				"Livros".autor AS autor,
				"Livros".genero AS genero,
				"Livros".descricao AS descricao,
				COALESCE(q.quantidade,0) AS quantidade,
				COALESCE(d.disponiveis,0) AS disponiveis
			FROM "Livros"
				LEFT JOIN (
					SELECT "LID", COUNT(*) AS quantidade
						FROM "Copias"
					GROUP BY "LID"
				) AS q
					ON "Livros"."LID" = q."LID"
				LEFT JOIN (
					SELECT "LID", COUNT(*) AS disponiveis
						FROM "Copias"
					WHERE "status" = 'disponivel'
					GROUP BY "LID"
				) AS d ON "Livros"."LID" = d."LID"
			WHERE "Livros".nome ILIKE ${'%' + texto + '%'}
			LIMIT 50;
		`;
		console.log(result);
		res.json(result);
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

app.post('/buscar',async (req,res) => {
	const { texto } = req.body;
	let result;
	try{
		result = await sql`
			SELECT
				"Usuarios"."UID",
				"Usuarios".usuario,
				"Usuarios".email,
				"Usuarios".genero,
				COALESCE(a.atrasados, 0) AS atrasados,
				COALESCE(r.reservados, 0) AS reservados
			FROM "Usuarios"
				LEFT JOIN (
					SELECT "UID", COUNT(*) AS atrasados
						FROM "Emprestimos"
					WHERE "prazo" < now()
					GROUP BY "UID"
				) AS a
					ON a."UID" = "Usuarios"."UID"
				LEFT JOIN (
					SELECT "UID", COUNT(*) AS reservados
						FROM "Fila"
						GROUP BY "UID"
				) AS r
					ON r."UID" = "Usuarios"."UID"
			LIMIT 50;
		`;
		res.json(result);
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

app.post('/registrar_autor',async (req,res) => {
	const {autor} = req.body;
	try{
		const result = await sql`
			INSERT INTO "Autores" (autor)
			VALUES (${autor})
		`;
		res.json({success:true, mensagem: 'Autor cadastrado' });
	} catch(err){
		if(err.code === '23505'){
			res.status(400).json({ success: false, mensagem: 'Autor já cadastrado!' });
		} else{
			res.status(500).json({ success: false, mensagem: err.message });
		}
	}
});

app.post('/registrar_genero',async (req,res) => {
	const {genero} = req.body;
	try{
		const result = await sql`
			INSERT INTO "Genero" (genero)
			VALUES (${genero})
		`;
		res.json({success:true, mensagem: 'Genero cadastrado' });
	} catch(err){
		if(err.code === '23505'){
			res.status(400).json({ success: false, mensagem: 'Genero já cadastrado!' });
		} else{
			res.status(500).json({ success: false, mensagem: err.message });
		}
	}
});


app.post('/registrar_livro',async (req,res) => {

	const {nome, autor, genero, descricao} = req.body;

	let session;

	try{

		const result = await sql`
			INSERT INTO "Livros" (nome, autor, genero, descricao)
			VALUES (${nome}, ${autor}, ${genero}, ${descricao})
			RETURNING "LID"
		`;

		const lid = result[0].LID;

		//console.log(result);
		//console.log(lid);

		session = neo.session();

		await session.run(`
			MERGE (l:Livro {lid: $lid})
			SET l.nome = $nome

			MERGE (a:Autor {nome: $autor})
			MERGE (g:Genero {nome: $genero})

			MERGE (l)-[:DO_AUTOR]->(a)
			MERGE (l)-[:DO_GENERO]->(g)
		`,{
			lid,
			nome,
			autor,
			genero
		});

		console.log("nó criado");

		res.json({
			success:true,
			mensagem: 'Livro cadastrado'
		});

	} catch(err){

		console.log(err);

		if(err.code === '23505'){

			res.status(400).json({
				success: false,
				mensagem: 'Livro já cadastrado!'
			});

		}else{

			res.status(500).json({
				success: false,
				mensagem: err.message
			});
		}

	} finally{

		if(session){
			await session.close();
		}
	}
});

app.post('/registrar_copia', async (req,res) => {
	const {lid} = req.body;
	try{
		const result = await sql`
			INSERT INTO "Copias" ("LID")
			VALUES (${lid})
			RETURNING "CID";
		`;
		res.json({success:true, mensagem: 'Copia cadastrado', CID: result[0].CID });
	} catch(err){
		if(err.code === '23505'){
			res.status(400).json({ success: false, mensagem: 'Copia já cadastrado!' });
		} else{
			res.status(500).json({ success: false, mensagem: err.message });
		}
	}
});
app.post('/reservar', async (req,res) => { 
	const { uid } = req.session;
	const { lid } = req.body;
	console.log(uid, lid);
	try{
		const result = await sql`
			INSERT INTO "Fila" ("LID", "UID")
			VALUES (${lid}, ${uid})
		`;
		res.json({success:true, mensagem: 'Usuario adicionado a fila de espera' });
	} catch(err){
		if(err.code === '23505'){
			res.status(400).json({ success: false, mensagem: 'o usuario já está na fila de espera!' });
		} else{
			res.status(500).json({ success: false, mensagem: err.message });
		}
	}
});

app.post('/emprestar', async (req,res) => {
	const { uid, cid } = req.body;
	let session;
	try{
		const id = await sql`
				SELECT *
				FROM "Copias"
				WHERE "CID" = ${cid}
		`;
		console.log("id",id);
		const lid = id[0].LID;
		const fila = await sql`
			SELECT DISTINCT
				"Fila"."UID" AS "UID",
				"Fila"."LID" AS "LID",
				COALESCE(posicao,0) AS posicao,
				COALESCE(disponiveis,0) AS disponiveis
			FROM "Fila"
				JOIN (
					SELECT
						"UID",
						"LID",
						ROW_NUMBER() OVER (PARTITION BY "LID" ORDER BY "data" ASC) AS posicao
					FROM "Fila"
					WHERE "LID" = ${lid}
				) AS p
					ON p."UID" = "Fila"."UID"
						AND p."LID" = "Fila"."LID"
				LEFT JOIN (
					SELECT "LID", COUNT(*) AS disponiveis
						FROM "Copias"
					WHERE "status" = 'disponivel'
					GROUP BY "LID"
				) AS d
					ON d."LID" = "Fila"."LID"
			WHERE "Fila"."UID" = ${uid}
				AND "Fila"."LID" = ${lid}
		`;
		console.log("fila",fila);
		if(fila.length == 0){
			res.json({success:false, mensagem: 'Não foi possivel emprestar o livro.\nLivro reservado por outra pessoa, ou Usuario não fez reserva.' });
		} else if(fila[0].posicao <= fila[0].disponiveis){
			await sql.begin(async tx => {
				await tx`
					INSERT INTO "Emprestimos" ("UID", "CID")
					VALUES (${uid}, ${cid});
				`;
				await tx`
					UPDATE "Copias"
						SET "status" = 'indisponivel'
					WHERE "CID" = ${cid};
				`;
				await tx`
					DELETE FROM "Fila"
					WHERE "UID" = ${uid}
						AND "LID" = ${lid};
				`;
			});

			session = neo.session();

			await session.executeWrite(tx =>
				tx.run(`
					MERGE (u:Usuario {uid: $uid})

					MERGE (l:Livro {lid: $lid})

					MERGE (u)-[:EMPRESTOU]->(l)
				`,{
					uid,
					lid,
				})
			);

			console.log('emprestimo registrado no neo4j');

			console.log('alo');
			res.json({success:true, mensagem: 'Livro emprestado' });
		}
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	} finally{

		if(session){
			await session.close();
		}
	}
});

app.post('/devolver', async (req,res) => {
	const { uid, cid } = req.body;
	console.log(uid,cid);
	try{
		const result = await sql.begin(async tx => {
			await tx`
				UPDATE "Copias"
				SET "status" = 'disponivel'
				WHERE "CID" = ${cid};
			`;
			return await tx`
				UPDATE "Emprestimos"
				SET "devolucao" = now()
				WHERE "UID" = ${uid}
					AND "CID" = ${cid}
					AND "devolucao" IS NULL
				RETURNING "prazo", DATE_PART('day', now() - "prazo") AS dias_atraso;
			`;
		});
		console.log(result);
		if (result.length === 0) {
			return res.json({
				success: false,
				mensagem: 'Nenhum empréstimo ativo encontrado para esse livro.',
			});
		}
		const atraso = result[0].dias_atraso;
		const mensagem = ( atraso > 0
			? `Livro devolvido com ${atraso} dia(s) de atraso.`
			: 'Livro devolvido dentro do prazo.'
		);
		return res.json({
			success: true,
			atraso,
			mensagem,
		});
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

// CASSANDRA

app.post('/fila', async (req,res) => { // cassandra
	const { uid } = req.body;
	try{
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

app.post('/emprestados', async (req,res) => { // cassandra
	const { uid } = req.body;
	try{
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

app.post('/historico', async (req,res) => { // cassandra
	const { uid } = req.body;
	try{
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

// NEO4J

app.get('/api/recomendados/:uid', async (req,res) => {

	const { uid } = req.params;

	console.log("uid recebido:", uid);

	let session;

	try{

		session = neo.session();

		const result = await session.run(`
			MATCH (u:Usuario {uid: $uid})-[:EMPRESTOU]->(l:Livro)

			MATCH (outro:Usuario)-[:EMPRESTOU]->(l)

			WHERE outro.uid <> $uid

			MATCH (outro)-[:EMPRESTOU]->(rec:Livro)

			WHERE rec.lid <> l.lid

			AND NOT EXISTS {
				(u)-[:EMPRESTOU]->(rec)
			}

			RETURN DISTINCT
				rec.lid AS lid,
				rec.nome AS nome,
				COUNT(*) AS score

			ORDER BY score DESC
			LIMIT 20
		`,{
			uid: String(uid)
		});

		console.log("records:", result.records);

		const livros = result.records.map(r => ({
			lid: r.get('lid'),
			nome: r.get('nome'),
			score: Number(r.get('score'))
		}));

		res.json({
			success:true,
			livros
		});

	}catch(err){

		console.log(err);

		res.status(500).json({
			success:false,
			mensagem: err.message
		});

	}finally{

		if(session){
			await session.close();
		}
	}
});

app.get('/health', async (req, res) => {
  try {
    await sql`SELECT 1`;

    res.json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000) + 's',
      database: 'connected',
      version: '1.0.0'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: 'Falha na conexão com o banco'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
