// document.createElement();
// .appendChild();
// .classList();

const livros = document.getElementById("livros");

function carregar_livros(l){
	for(let i = 0; i < l.length; i++){
		console.log(l[i]);
		const button = document.createElement("a");
		const pre = document.createElement("pre");
		button.href = `livro?lid=${l[i].LID}`;
		pre.textContent = `Nome: ${l[i].nome}\n` +
							 `Autor: ${l[i].autor}\n` +
							 `Genero: ${l[i].genero}\n` +
							 `Quantidade: ${l[i].quantidade}\n` +
							 `Disponiveis: ${l[i].disponiveis}\n`;
		livros.appendChild(button);
		button.appendChild(pre);
	}
}

async function pesquisar(){
	let texto = document.getElementById("pesquisa_input").value;
	if(texto == null) texto = "";

	const res = await fetch(`/pesquisa`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ texto })
	});

	const data = await res.json();

	console.log("result",data);

	livros.replaceChildren();

	if(data != undefined) carregar_livros(data);
}

pesquisar();
