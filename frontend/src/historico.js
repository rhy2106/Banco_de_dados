const historico = document.getElementById("historico");

function carregar_historico(lista){
	historico.replaceChildren();
	for(let i = 0; i < lista.length; i++){
		console.log(lista[i]);
		const item = document.createElement("div");
		const pre = document.createElement("pre");
		pre.textContent = `Nome: ${lista[i].nome_livro}\n` +
						  `Autor: ${lista[i].autor_livro}\n` +
						  `Genero: ${lista[i].genero_livro}\n` +
						  `Data de emprestimo: ${lista[i].emprestimo}\n` +
						  `Prazo: ${lista[i].prazo}\n` + 
						  `Data de devolucao: ${lista[i].devolucao}\n` +
						  `Status: ${lista[i].status}\n`;
		historico.appendChild(item);
		item.appendChild(pre);
	}
}

async function carregar(){
	const params = new URLSearchParams(window.location.search);
	const uid = params.get('uid');

	const res = await fetch(`/historico`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ uid })
	});

	const { dataHistorico } = await res.json();
	console.log(dataHistorico);
	if( dataHistorico != undefined ) carregar_historico(dataHistorico);
}

carregar();


