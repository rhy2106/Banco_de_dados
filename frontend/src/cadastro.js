async function cadastro(){
	const usuario = document.getElementById("usuario").value;
	const email = document.getElementById("email").value;
	const genero = document.getElementById("genero").value;
	const senha = document.getElementById("senha").value;

	const res = await fetch(`/cadastrar`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ usuario, email, genero, senha })
	});

	const data = await res.json();
	if(data.success === true){
		window.location.href = "/login";
	}
}
