# Banco de dados
# Descrição
O projeto é uma aplicação de gerenciamento de biblioteca, que gerencia as reservas de livros.

# Sumario
- [Objetivos/Motivações](#objetivos-e-motivações)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como rodar o MVP localmente](#como-rodar-localmente)

# Objetivos e Motivações
O app foi desenvolvido como projeto na disciplina `CCD410-PERFORMANCE E TUNNING DE DADOS`. O objetivo era criar um Projeto que utilize 3 bancos de dados, 1 SQL e 2 noSQL. O tema escolhido para o projeto é um gerenciador de Biblioteca.

# Tecnologias Utilizadas
- **Backend:** Node.js, Express, JavaScript
- **Frontend:** HTML CSS JavaScript
- **Banco de Dados:** PostgreSQL (Supabase), Cassandra (Astra / datastax), Neo4J (Aura)
- **Outros:** dotenv

# Como rodar localmente

## Pré-requisitos
- Node.js >= 24.9.0
- PostgreSQL >= 15
- npm

## Variaveis de ambiente
> arquivo .env
```
SUPABASE_URL=${SEU_URL}
NEO4J_URI=${SEU_URI}
NEO4J_USER=${SEU_USER}
NEO4J_PASSWORD=${SUA_SENHA}
```
## Clonar repositorio
```
git clone git@github.com:rhy2106/Banco_de_dados.git
```
## Instalar dependencias
```bash
cd Banco_de_dados # pasta do repositorio
cd backend 
npm install
```
> Obs: 
>
> Conecte com o seu proprio banco de dados(supabase e Neo4j)

## Rodar o banco de dados:
1. utilize o arquivo `Banco_de_dados/backend/supabase_tables.sql`, para criar as tabelas do postgreSQL
```bash
npm start
```

## Abrir o site:
Abra na pagina `[IP]:[PORTA]`
