import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import path from 'path';
import {sql, cql} from './db.js';

const app = express();
const __dirname = new URL('.', import.meta.url).pathname;
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
	else res.sendFile(path.resolve('../frontend/view/fila.html'),{});
});

app.get('/historico',async (req,res)=>{
	if(!req.session.uid) res.redirect('/login');
	else res.sendFile(path.resolve('../frontend/view/historico.html'),{});
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
		console.log("entrou /livro");
		const result = await sql`
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
					ON q."LID" = "Livros"."LID"
				LEFT JOIN (
					SELECT "LID", COUNT(*) AS disponiveis
						FROM "Copias"
					WHERE "status" = 'disponivel'
					GROUP BY "LID"
				) AS d
					ON d."LID" = "Livros"."LID"
			WHERE "Livros"."LID" = ${lid}
		`
		console.log("livro",result);
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
	console.log(usuario,email,senha,genero);
	try{
		const result = await sql`
			INSERT INTO "Usuarios" (usuario, email, senha, genero)
			VALUES (${usuario}, ${email}, ${senha}, ${genero})
		`;
		res.json({success:true});
	} catch(err){
		if(err.code === '23505'){ // PostgreSQL unique violation
			res.status(400).json({ success: false, mensagem: 'Email já cadastrado!' });
		} else{
			res.status(500).json({ success: false, mensagem: err.message });
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
	try{
		const result = await sql`
			INSERT INTO "Livros" (nome, autor, genero, descricao)
			VALUES (${nome}, ${autor}, ${genero}, ${descricao})
		`;
		res.json({success:true, mensagem: 'Livro cadastrado' });
	} catch(err){
		if(err.code === '23505'){
			res.status(400).json({ success: false, mensagem: 'Livro já cadastrado!' });
		} else{
			res.status(500).json({ success: false, mensagem: err.message });
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
		await sql`
			INSERT INTO "Fila" ("LID", "UID")
			VALUES (${lid}, ${uid})
		`;

		const f = await sql`
			SELECT DISTINCT
				"Livros".nome AS nome_livro,
				"Livros".autor AS autor_livro,
				"Livros".genero AS genero_livro,
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
				JOIN "Livros"
					ON "Livros"."LID" = "Fila"."LID"
			WHERE "Fila"."UID" = ${uid}
				AND "Fila"."LID" = ${lid}
		`;

		await cql.execute(`
				INSERT INTO fila_usuario (uid, lid, nome_livro, autor_livro, genero_livro,status)
				VALUES (?, ?, ?, ?, ?, ?)
			`, [
				uid,
				lid,
				f[0].nome_livro,
				f[0].autor_livro,
				f[0].genero_livro,
				(f[0].posicao <= f[0].disponiveis ? 'Disponivel' : 'Aguardando')
			], { prepare: true }
		);
		console.log("insert cassandra");

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
	try{
		const livro = await sql`
				SELECT 
					"Copias"."CID" AS "CID",
					"Copias".status AS status,
					"Copias"."LID" AS "LID",
					"Livros".nome AS nome,
					"Livros".autor AS autor,
					"Livros".genero AS genero
				FROM "Copias"
					JOIN "Livros"
						ON "Livros"."LID" = "Copias"."LID"
				WHERE "CID" = ${cid}
		`;
		const lid = livro[0].LID;
		const f = await sql`
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

		if(f.length == 0){
			res.json({success:false, mensagem: 'Não foi possivel emprestar o livro.\nLivro reservado por outra pessoa, ou Usuario não fez reserva.' });
		} else if(f[0].posicao <= f[0].disponiveis){
			const emprestimo = await sql.begin(async tx => {
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
				return await tx`
					INSERT INTO "Emprestimos" ("UID", "CID")
					VALUES (${uid}, ${cid})
					RETURNING *;
				`;
			});

			await cql.execute(`
					DELETE FROM fila_usuario
					WHERE uid = ?
					AND lid = ?
				`, [
					uid,
					lid,
				], { prepare: true }
			);

			await cql.execute(`
					INSERT INTO emprestimos (eid, uid, cid, nome_livro, autor_livro, genero_livro, emprestimo, prazo, devolucao, status)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`, [
					emprestimo[0].EID,
					uid,
					cid,
					livro[0].nome,
					livro[0].autor,
					livro[0].genero,
					emprestimo[0].emprestimo,
					emprestimo[0].prazo,
					null,
					'emprestado'
				], { prepare: true }
			);
			
			res.json({success:true, mensagem: 'Livro emprestado' });
		}
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
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
				RETURNING "emprestimo", "devolucao", "prazo", DATE_PART('day', now() - "prazo") AS dias_atraso;
			`;
		});
		console.log(result);
		if (result.length === 0) {
			return res.json({
				success: false,
				mensagem: 'Nenhum empréstimo ativo encontrado para esse livro.',
			});
		}

		await cql.execute(`
				UPDATE emprestimos
				SET status = 'devolvido', devolucao = ?
				WHERE uid = ?
				AND emprestimo = ?
				AND cid = ?
			`,
			[
				result[0].devolucao,
				uid,
				result[0].emprestimo,
				cid
			],
			{prepare: true}
		);

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

app.get('/fila_usuario', async (req,res) => { // cassandra
	const { uid } = req.session;
	try{
		const data = await cql.execute(`
				SELECT * FROM fila_usuario
				WHERE uid = ?
			`,
			[ uid ],
			{ prepare: true }
		);

		res.json({ sucess: true, dataFila:data.rows ,mensagem: "Fila lida com sucesso" });
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

app.get('/emprestimos_usuario', async (req,res) => { // cassandra
	const { uid } = req.session;
	try{
		console.log("/emprestimo_usuario");
		const data = await cql.execute(`
				SELECT * FROM emprestimos
				WHERE uid = ?
				ORDER BY emprestimo DESC
			`,
			[ uid ],
			{ prepare: true }
		);

		for(const e of data.rows){
			const agora = new Date();
			if(e.prazo < agora && e.status != 'devolvido'){
				e.status = 'atrasado';
				await cql.execute(`
						UPDATE emprestimos
						SET status = 'atrasado'
						WHERE uid = ?
						AND emprestimo = ?
						AND cid = ?
					`,
					[ uid, e.emprestimo, e.cid ],
					{prepare: true}
				);
			}
		}

		console.log(data.rows);
		res.json({ sucess: true, dataEmprestimo: data.rows,mensagem: "Fila lida com sucesso" });
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

app.post('/historico', async (req,res) => { // cassandra
	const { uid } = (req.body.uid == undefined ? req.session : req.body);
	console.log(uid);
	try{
		const data = await cql.execute(`
				SELECT * FROM emprestimos
				WHERE uid = ?
				ORDER BY emprestimo DESC
			`,
			[ uid ],
			{ prepare: true }
		);
		console.log(data);

		for(const e of data.rows){
			const agora = new Date();
			if(e.prazo < agora && e.status != 'devolvido'){
				e.status = 'atrasado';
				await cql.execute(`
						UPDATE emprestimos
						SET status = 'atrasado'
						WHERE uid = ?
						AND emprestimo = ?
						AND cid = ?
					`,
					[ uid, e.emprestimo, e.cid ],
					{prepare: true}
				);
			}
		}

		console.log("rows",data.rows);
		res.json({ sucess: true, dataHistorico: data.rows ,mensagem: "Fila lida com sucesso" });
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
	}
});

// NEO4J

app.post('/recomendados', async (req,res) => {
	const { lid } = req.body;
	try{
	} catch(err){
		res.status(500).json({ success: false, mensagem: err.message });
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


