CREATE TABLE "Usuarios" (
  "UID" uuid NOT NULL DEFAULT gen_random_uuid(),
  "usuario" character varying NOT NULL UNIQUE,
  "senha" character varying NOT NULL,
  "email" character varying NOT NULL UNIQUE,
  "genero" character varying NOT NULL,
  "adm" boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY ("UID")
);

CREATE TABLE "Autores" (
  "autor" character varying NOT NULL,
  PRIMARY KEY ("autor")
);

CREATE TABLE "Genero" (
  "genero" character varying NOT NULL,
  PRIMARY KEY ("genero")
);

CREATE TABLE "Livros" (
  "LID" uuid NOT NULL DEFAULT gen_random_uuid(),
  "nome" character varying NOT NULL,
  "descricao" character varying NOT NULL,
  "autor" character varying NOT NULL,
  "genero" character varying NOT NULL,
  PRIMARY KEY ("LID"),
  FOREIGN KEY ("autor") REFERENCES "Autores"("autor"),
  FOREIGN KEY ("genero") REFERENCES "Genero"("genero")
);

CREATE TABLE "Fila" (
  "FID" uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  "data" DATE NOT NULL DEFAULT now(),
  "UID" uuid NOT NULL,
  "LID" uuid NOT NULL,
  PRIMARY KEY ("FID"),
  FOREIGN KEY ("UID") REFERENCES "Usuarios"("UID"),
  FOREIGN KEY ("LID") REFERENCES "Livros"("LID"),
  UNIQUE ("UID","LID")
);

CREATE TABLE "Copias" (
  "CID" uuid NOT NULL DEFAULT gen_random_uuid(),
  "status" character varying NOT NULL DEFAULT 'disponivel',
  "LID" uuid NOT NULL,
  PRIMARY KEY ("CID"),
  FOREIGN KEY ("LID") REFERENCES "Livros"("LID")
);

CREATE TABLE "Emprestimos" (
  "EID" uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  "emprestimo" DATE NOT NULL DEFAULT now(),
  "devolucao" DATE NULL,
  "prazo" DATE NOT NULL DEFAULT (CURRENT_DATE + 7),
  "UID" uuid NOT NULL,
  "CID" uuid NOT NULL,
  PRIMARY KEY ("EID"),
  FOREIGN KEY ("UID") REFERENCES "Usuarios"("UID"),
  FOREIGN KEY ("CID") REFERENCES "Copias"("CID")
);
