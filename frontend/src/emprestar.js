async function emprestar(){
	const uid = document.getElementById("uid_emprestar").value;
	const cid = document.getElementById("cid_emprestar").value;

	const res = await fetch(`/emprestar`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ uid,cid })
	});

	const data = await res.json();
	const res_emprestar = document.getElementById("res_emprestar");
	if(data.success === true)
		res_emprestar.innerText = "Livro Emprestado com Sucesso"
	else
		res_emprestar.innerText = "Falha ao Emprestar o Livro"
}

async function devolver(){
	const uid = document.getElementById("uid_devolver").value;
	const cid = document.getElementById("cid_devolver").value;

	const res = await fetch(`/devolver`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ uid,cid })
	});

	const data = await res.json();
	const res_devolver = document.getElementById("res_devolver");
	if(data.success === true)
		res_devolver.innerText = "Livro Devolvido com Sucesso"
	else
		res_devolver.innerText = "Falha ao Devolver o Livro"
}

