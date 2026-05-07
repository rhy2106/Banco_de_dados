const fila = document.getElementById("fila");
const emprestimos = document.getElementById("emprestimos");

function carregar_fila(lista){
	fila.replaceChildren();
	for(let i = 0; i < lista.length; i++){
		console.log(lista[i]);
		const item = document.createElement("div");
		const pre = document.createElement("pre");
		pre.textContent = `Nome: ${lista[i].nome_livro}\n` +
						  `Autor: ${lista[i].autor_livro}\n` +
						  `Genero: ${lista[i].genero_livro}\n` +
						  `Status: ${lista[i].status}\n`;
		fila.appendChild(item);
		item.appendChild(pre);
	}
}

function carregar_emprestimos(lista){
	emprestimos.replaceChildren();
	for(let i = 0; i < lista.length; i++){
		console.log(lista[i]);
		if(lista[i].status == 'devolvido') continue;
		const item = document.createElement("div");
		const pre = document.createElement("pre");
		pre.textContent = `Nome: ${lista[i].nome_livro}\n` +
						  `Autor: ${lista[i].autor_livro}\n` +
						  `Genero: ${lista[i].genero_livro}\n` +
						  `Data de emprestimo: ${lista[i].emprestimo}\n` +
						  `Prazo: ${lista[i].prazo}\n` + 
						  `Status: ${lista[i].status}\n`;
		emprestimos.appendChild(item);
		item.appendChild(pre);
	}
}

async function carregar(){
	const resFila = await fetch(`/fila_usuario`,{
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	const { dataFila } = await resFila.json();
	console.log(dataFila);
	if( dataFila != undefined ) carregar_fila(dataFila);

	const resEmprestimo = await fetch(`/emprestimos_usuario`,{
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	const { dataEmprestimo } = await resEmprestimo.json();
	if( dataEmprestimo != undefined ) carregar_emprestimos(dataEmprestimo);

}

carregar();

