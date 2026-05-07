async function cadastro_genero(){
	const genero = document.getElementById("genero").value;

	const res = await fetch(`/registrar_genero`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ genero })
	});

	const data = await res.json();
	const res_genero = document.getElementById("res_genero");
	if(data.success === true)
		res_genero.innerText = "Genero Cadastrado com Sucesso"
	else
		res_genero.innerText = "Falha ao Cadastrar o Genero"
}
async function cadastro_autor(){
	const autor = document.getElementById("autor").value;

	const res = await fetch(`/registrar_autor`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ autor })
	});

	const data = await res.json();
	const res_autor = document.getElementById("res_autor");
	if(data.success === true)
		res_autor.innerText = "Autor Cadastrado com Sucesso"
	else
		res_autor.innerText = "Falha ao Cadastrar o Autor"
}
async function cadastro_livro(){
	const nome = document.getElementById("nome").value;
	const descricao = document.getElementById("descricao").value;
	const genero = document.getElementById("genero_livro").value;
	const autor = document.getElementById("autor_livro").value;

	const res = await fetch(`/registrar_livro`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ nome, descricao, genero, autor })
	});

	const data = await res.json();
	const res_livro = document.getElementById("res_livro");
	if(data.success === true)
		res_livro.innerText = "Livro Cadastrado com Sucesso"
	else
		res_livro.innerText = "Falha ao Cadastrar o Livro"
}

async function cadastro_copia(){
	const lid = document.getElementById("lid").value;

	const res = await fetch(`/registrar_copia`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ lid })
	});

	const data = await res.json();
	const res_copia = document.getElementById("res_copia");
	if(data.success === true)
		res_copia.innerText = "Copia Cadastrado com Sucesso"
	else
		res_copia.innerText = "Falha ao Cadastrar a Copia"
}
