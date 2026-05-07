// document.createElement();
// .appendChild();
// .classList();

const usuarios = document.getElementById("usuarios");

function carregar_usuarios(l){
	for(let i = 0; i < l.length; i++){
		console.log(l[i]);
		const button = document.createElement("a");
		const pre = document.createElement("pre");
		button.href = `historico?uid=${l[i].UID}`;
		pre.textContent = `usuario: ${l[i].usuario}\n` +
							 `email: ${l[i].email}\n` +
							 `genero: ${l[i].genero}\n` +
							 `atrasados: ${l[i].atrasados}\n` + 
							 `reservados: ${l[i].reservados}\n`;
		usuarios.appendChild(button);
		button.appendChild(pre);
	}
}

async function pesquisar(){
	let texto = document.getElementById("pesquisa_input").value;
	if(texto == null) texto = "";

	const res = await fetch(`/buscar`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ texto })
	});

	const data = await res.json();

	console.log("result",data);

	usuarios.replaceChildren();

	if(data != undefined) carregar_usuarios(data);
}

pesquisar();
