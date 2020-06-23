 Desafio Final - Foodfy

## Sobre

Site de Receitas Foodfy.

Projeto do desafio final do bootcamp LaunchBase, da Rocketseat.

### Tecnologias

**Front-End**
- [x] HTML
- [x] CSS
- [x] Javascript
- [x] Nunjucks *(Template Engine)*

![](https://github.com/WesleDev/Foodyfy/blob/master/public/assets/home.png)

**Back-End**
- [x] NodeJS
- [x] Postgre *(SQL Server)*
- [x] Express *(Framework)*

## Instalação

### Itens Necessários

- [Node.js](https://nodejs.org/en/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Postbird](https://www.electronjs.org/apps/postbird)
- Account on [MailTrap](https://mailtrap.io/)

### Passos

1. Baixar os arquivos do projeto;
1. Abrir pasta do projeto no VSCode;
1. Executar comando ```npm install``` no terminal;
1. Executar as linhas do arquivo **database.sql** no Postbird;
1. Configure o arquivo **db.js** na pasta "*src/config*" com suas informações do Postbird;
1. Configurar o arquivo **mailer.js** na pasta "*src/lib*" com suas informações do MailTrap;
1. Executar o comando ```node seeds.js``` no terminal;
1. Executar o comando ```npm start``` no terminal.

## Observações

As informações do usuário administrador do sistema, se encontram no arquivo **seeds.js**. 
Após rodar o seeds.js, entrar na sua conta do [MailTrap](https://mailtrap.io/). para receber sua senha do administrador e demais usuarios.
