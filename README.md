# Banco de dados
# Descrição
O projeto é uma aplicação de gerenciamento de biblioteca, que gerencia as reservas de livros.

# Sumario
- [Objetivos/Motivações](#objetivos-e-motivações)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Divisão dos Bancos](#divisão-dos-bancos-de-dados)
- [Como rodar localmente](#como-rodar-localmente)
- [Autores](#autores)

# Objetivos e Motivações
O app foi desenvolvido como projeto na disciplina `CCD410-PERFORMANCE E TUNNING DE DADOS`. O objetivo era criar um Projeto que utilize 3 bancos de dados, 1 SQL e 2 noSQL. O tema escolhido para o projeto é um gerenciador de Biblioteca.

# Tecnologias Utilizadas
- **Backend:** Node.js, Express, JavaScript
- **Frontend:** HTML CSS JavaScript
- **Banco de Dados:** PostgreSQL (Supabase), Cassandra (Astra / datastax), Neo4J (Aura)
- **Outros:** dotenv

# Divisão dos Bancos de dados

## PostgreSQL
O PostgreSQL foi utilizado para armazenar os dados de forma consistente.
Garantindo que não seja possivel duas pessoas pegarem o mesmo livro ao mesmo tempo no sistema.

## Cassandra
O Cassandra foi utilizado para fazer as queries da fila.
O Cassandra foi escolhido para a realização dessa parte do projeto, pois não é necessario consistencia nessa parte.
Visto que a query é apenas para a visualização do usuario.

## Neo4J
O Neo4J foi utilizado para armazenar as relações entre as pessoas e os livros.
Para fazer as queries de recomendações.
Recomendando para o usuario livros que foram lidos por outros usuarios, que leram o mesmo livro.

# Como rodar localmente

## Pré-requisitos
- Node.js
- PostgreSQL
- Cassandra
- Neo4J
- npm

## Variaveis de ambiente
> arquivo .env
```
SUPABASE_URL=${SEU_URL}
ASTRA_URL=${SEU URL}
ASTRA_TOKEN=${SEU TOKEN}
NEO4J_URI=${SEU_URI}
NEO4J_USER=${SEU_USER}
NEO4J_PASSWORD=${SUA_SENHA}
```
> baixe o seu arquivo `secure-connect-teste.zip` para utilizar com o Astra
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

# Autores
- Mauricio Yudi Kuniyoshi 
- Rafael Hideaki Yara
