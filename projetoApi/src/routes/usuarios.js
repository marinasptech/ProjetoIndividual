var express = require("express");
var router  = express.Router();
var db      = require("../database/config");

router.post("/", function (req, res) {
    var nome  = req.body.nome;
    var email = req.body.email;
    var senha = req.body.senha;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    // Verifica se o e-mail já está cadastrado
    db.executar("SELECT id FROM usuarios WHERE email = '" + email + "'")
        .then(function (resultado) {

            if (resultado.length > 0) {
                return res.status(409).json({ mensagem: "E-mail já cadastrado." });
            }

            // Salva o usuário no banco
            var sql = "INSERT INTO usuarios (nome, email, senha) VALUES ('" +
                nome + "', '" + email + "', '" + senha + "')";

            db.executar(sql)
                .then(function (resultado) {
                    return res.status(201).json({
                        mensagem: "Usuário cadastrado com sucesso.",
                        id: resultado.insertId
                    });
                })
                .catch(function (erro) {
                    console.error("Erro ao inserir usuário:", erro);
                    return res.status(500).json({ mensagem: "Erro interno no servidor." });
                });
        })
        .catch(function (erro) {
            console.error("Erro ao verificar e-mail:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
});

router.post("/login", function (req, res) {
    var email = req.body.email;
    var senha = req.body.senha;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "Informe e-mail e senha." });
    }

    // Busca o usuário pelo e-mail e senha
    var sql = "SELECT id, nome, email FROM usuarios WHERE email = '" +
        email + "' AND senha = '" + senha + "'";

    db.executar(sql)
        .then(function (resultado) {

            // Se não encontrou nenhum usuário, e-mail ou senha estão errados
            if (resultado.length === 0) {
                return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
            }

            // Login OK — devolve os dados do usuário para o front salvar
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
});

// ─────────────────────────────────────────────────────────────────
// GET /usuarios — Lista todos os usuários
// ─────────────────────────────────────────────────────────────────
router.get("/", function (req, res) {
    db.executar("SELECT id, nome, email, criado_em FROM usuarios ORDER BY criado_em DESC")
        .then(function (resultado) {
            return res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.error("Erro ao listar usuários:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
});

module.exports = router;