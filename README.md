<div align="center">
<br/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Georgia&size=42&duration=3000&pause=1000&color=E8A0BF&center=true&vCenter=true&width=600&lines=MaBallet;Arte.+T%C3%A9cnica.+Emo%C3%A7%C3%A3o.">
  <img src="https://readme-typing-svg.demolab.com?font=Georgia&size=42&duration=3000&pause=1000&color=B76E79&center=true&vCenter=true&width=600&lines=MaBallet;Arte.+T%C3%A9cnica.+Emo%C3%A7%C3%A3o." alt="MaBallet">
</picture>

<br/>

*Uma história contada através do corpo, da música e da alma.*

<br/>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

</div>

---

## Sobre

Sistema web informativo e interativo inspirado no ballet **Dom Quixote**, desenvolvido como Projeto Individual da disciplina de Pesquisa e Inovação — SPTECH 2026.

A aplicação une autenticação de usuários, banco de dados, consumo de API e um quiz temático, demonstrando a aplicação prática de conceitos de desenvolvimento web full-stack.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) 8+
- npm

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/marinasptech/ProjetoIndividual.git
cd ProjetoIndividual/projetoApi

# Instale as dependências
npm install
```

Configure as variáveis de ambiente editando `.env.dev`:

```env
APP_PORT=3000
APP_HOST=localhost
AMBIENTE_PROCESSO=desenvolvimento
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=maballet
```

Crie o banco de dados executando o script:

```bash
mysql -u root -p < src/database/script-tabelas.sql
```

---

## Execução

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

Acesse em `http://localhost:3333`

---

## Estrutura do Projeto

```
projetoApi/
├── app.js                    # Entrada da aplicação
├── .env / .env.dev           # Variáveis de ambiente
├── public/
│   ├── index.html            # Home
│   ├── login.html            # Login
│   ├── cadastro.html         # Cadastro
│   ├── dashboard.html        # Área autenticada
│   ├── quiz.html             # Quiz interativo
│   ├── estilo.css            # Estilos globais
│   ├── sessao.js             # Gerenciamento de sessão
│   └── assets/               # Imagens
└── src/
    ├── controllers/
    │   ├── usuarioController.js
    │   └── quizController.js
    ├── models/
    │   ├── usuarioModel.js
    │   └── quizModel.js
    ├── routes/
    │   ├── index.js
    │   ├── usuarios.js
    │   └── quiz.js
    └── database/
        ├── config.js
        └── script-tabelas.sql
```

---

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Página principal |
| `POST` | `/usuarios/cadastro` | Cadastro de usuário |
| `POST` | `/usuarios/login` | Autenticação |
| `GET` | `/usuarios/:id` | Dados do usuário |
| `POST` | `/quiz` | Salvar resultado do quiz |
| `GET` | `/quiz/:id` | Histórico do usuário |

---

## Banco de Dados

```sql
-- Tabela de usuários
usuarios (id, nome, email, senha, criado)

-- Tabela de resultados do quiz
quiz_respostas (id, fkUsuario, perfil, pontuacao,
                cenario, estilo, reacao, motivacao, respondido)
```

---

<div align="center">

*Ballet Dom Quixote · Projeto Individual 2026 · SPTECH*

**[@marinasptech](https://github.com/marinasptech)**

</div>
