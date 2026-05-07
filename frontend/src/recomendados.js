const lista = document.getElementById("lista_recomendados");

async function Recomendados(){

	try{

		const res_session = await fetch('/session', {
			credentials: 'include'
		});

		const session = await res_session.json();

		const uid = session.user.uid;

		console.log("UID:", uid);

		const response = await fetch(`/api/recomendados/${uid}`);

		const data = await response.json();

		console.log(data);

		lista.innerHTML = "";

		if(!data.success){
			lista.innerHTML = `<p>Erro ao carregar recomendações</p>`;
			return;
		}

		if(data.livros.length === 0){
			lista.innerHTML = `<p>Nenhuma recomendação encontrada</p>`;
			return;
		}

		data.livros.forEach(livro => {

			const div = document.createElement("div");

			div.className = "livro";

			div.innerHTML = `
				<h3>${livro.nome}</h3>
			`;

			lista.appendChild(div);
		});

	}catch(err){

		console.log(err);

		lista.innerHTML = `<p>${err}</p>`;
	}
}

Recomendados();