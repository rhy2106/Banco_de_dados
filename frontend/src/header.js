// document.createElement();
// .appendChild();
// .classList();

const header = document.getElementById("header");

function botoes(categorias){
	for(let i = 0; i < categorias.length; i++){
		console.log(categorias[i]);
		const button = document.createElement("a");
		button.href = categorias[i];
		button.textContent = categorias[i];
		header.appendChild(button);
	}
}

async function session(){
	const res = await fetch('/session',{ credentials: 'include' });

	const {login,user} = await res.json();

	const c_not = ['home','signin','login'];
	const c_user = ['home','fila','historico','logout'];
	const c_adm = ['home','emprestar','cadastro','usuarios','logout'];
	
	console.log(login,user);

	if(!login) botoes(c_not);
	else if( !user.adm ) botoes(c_user);
	else if( user.adm ) botoes(c_adm);
}

session();

