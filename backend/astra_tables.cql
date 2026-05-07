CREATE TABLE fila_usuario (
    uid uuid,
    lid uuid,
    nome_livro text,
    autor_livro text,
    genero_livro text,
    status text,
    PRIMARY KEY ((uid), lid)
);

CREATE TABLE emprestimos (
    uid uuid,
    eid uuid,
    lid uuid,
    nome_livro text,
    autor_livro text,
    genero_livro text,
    emprestimo timestamp,
    prazo timestamp,
    devolucao timestamp,
    status text,
    PRIMARY KEY ((uid), emprestimo, eid)
)
WITH CLUSTERING ORDER BY (emprestimo DESC);
