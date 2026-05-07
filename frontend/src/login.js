async function login(){
	const email = document.getElementById("email").value;
	const senha = document.getElementById("senha").value;

	const res = await fetch(`/login`,{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ email, senha })
	});

	const data = await res.json();
	if(data.success === true){
		await fetch('/session',{credentials:'include'});
		window.location.href = "/home";
	}
}

