// document.createElement();
// .appendChild();
// .classList();

async function pesquisar(){

	const params = new URLSearchParams(window.location.search);
	const lid = params.get('lid');

	const res = await fetch(`/livro`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ lid })
	});

	return await res.json();
}

async function carregar_livro(){
	const l = document.getElementById("livro");
	const {livro} = await pesquisar();

	const nome = document.createElement("div");
	const autor = document.createElement("div");
	const genero = document.createElement("div");
	
	const descricao = document.createElement("div");
	const quantidade = document.createElement("div");
	const disponiveis = document.createElement("div");
	nome.textContent = `Nome: ${livro.nome}\n`;
	autor.textContent = `Autor: ${livro.autor}\n`;
	genero.textContent = `Genero: ${livro.genero}\n`;
	descricao.textContent = `Genero: ${livro.descricao}\n`;
	quantidade.textContent = `Quantidade: ${livro.quantidade}\n`;
	disponiveis.textContent = `Disponiveis: ${livro.disponiveis}\n`;

	l.appendChild(nome);
	l.appendChild(autor);
	l.appendChild(genero);
	l.appendChild(descricao);
	l.appendChild(quantidade);
	l.appendChild(disponiveis);
	return livro;
}

async function reservar(){
	const params = new URLSearchParams(window.location.search);
	const lid = params.get('lid');

	const res = await fetch(`/reservar`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ lid })
	});

	const data = await res.json();
	console.log(data);

	const res_reservar = document.getElementById("res_reservar");
	res_reservar.innerText = data.mensagem;
}

carregar_livro();
