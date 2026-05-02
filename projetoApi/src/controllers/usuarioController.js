var usuarioModel = require("../models/usuarioModel");
var aquarioModel = require("../models/aquarioModel");
var db = require("../database/config");


function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está indefinida!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {
    var sql = "SELECT id, nome, email FROM usuarios WHERE email = '" +
        email + "' AND senha = '" + senha + "'";
 
    db.executar(sql)
        .then(function (resultado) {
            if (resultado.length === 0) {
                return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
            }
 
            var usuario = resultado[0];
            return res.status(200).json({
                mensagem: "Login realizado com sucesso.",
                token: "logado",
                usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
            });
        })
        .catch(function (erro) {
            console.error("Erro no login:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
}
}

function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var cpf = req.body.cpfServer;

    // Faça as validações dos valores
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (fkEmpresa == undefined) {
        res.status(400).send("Sua empresa a vincular está undefined!");
    } else if (cpf == undefined) {
        res.status(400).send("Seu CPF a vincular está undefined!");
    } else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        usuarioModel.cadastrar(nome, email, senha, fkEmpresa,cpf)
            if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }
 
    db.executar("SELECT id FROM usuarios WHERE email = '" + email + "'")
        .then(function (resultado) {
            if (resultado.length > 0) {
                return res.status(409).json({ mensagem: "E-mail já cadastrado." });
            }
 
            var sql = "INSERT INTO usuarios (nome, email, senha) VALUES ('" +
                nome + "', '" + email + "', '" + senha + "')";
 
            return db.executar(sql)
                .then(function (resultado) {
                    return res.status(201).json({
                        mensagem: "Usuário cadastrado com sucesso.",
                        id: resultado.insertId
                    });
                });
        })
        .catch(function (erro) {
            console.error("Erro ao cadastrar usuário:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
}
    }
// GET /usuarios/:id — Busca por ID
function buscarPorId(req, res) {
    var id = req.params.id;
 
    db.executar("SELECT id, nome, email, criado FROM usuarios WHERE id = " + id)
        .then(function (resultado) {
            if (resultado.length === 0) {
                return res.status(404).json({ mensagem: "Usuário não encontrado." });
            }
            return res.status(200).json(resultado[0]);
        })
        .catch(function (erro) {
            console.error("Erro ao buscar usuário:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
}
 
// DELETE /usuarios/:id — Remove usuário
function deletar(req, res) {
    var id = req.params.id;
 
    db.executar("DELETE FROM usuarios WHERE id = " + id)
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ mensagem: "Usuário não encontrado." });
            }
            return res.status(200).json({ mensagem: "Usuário removido com sucesso." });
        })
        .catch(function (erro) {
            console.error("Erro ao deletar usuário:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
}
 
module.exports = { cadastrar, autenticar, buscarPorId, deletar };