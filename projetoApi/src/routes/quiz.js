var express = require("express");
var router = express.Router();
var db = require("../database/config");

// POST /quiz — Salva respostas do quiz
router.post("/", function (req, res) {
    var usuario_id = req.body.usuario_id;
    var perfil = req.body.perfil;
    var pontuacao = req.body.pontuacao;
    var cenario = req.body.cenario;
    var estilo = req.body.estilo;
    var reacao = req.body.reacao;
    var motivacao = req.body.motivacao;

    if (!usuario_id || !perfil || pontuacao === undefined) {
        return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    var sql = "INSERT INTO quiz_respostas (fkUsuario, perfil, pontuacao, cenario, estilo, reacao, motivacao) " +
        "VALUES (" + usuario_id + ", '" + perfil + "', " + pontuacao + ", '" +
        cenario + "', '" + estilo + "', '" + reacao + "', '" + motivacao + "')";

    db.executar(sql)
        .then(function (resultado) {
            return res.status(201).json({
                mensagem: "Respostas salvas com sucesso.",
                id: resultado.insertId,
                perfil: perfil,
                pontuacao: pontuacao
            });
        })
        .catch(function (erro) {
            console.error("Erro ao salvar quiz:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
});

// GET /quiz/dashboard — KPIs para a dashboard
router.get("/dashboard", function (_req, res) {
    var dados = {};

    // Total de usuários
    db.executar("SELECT COUNT(*) AS total_usuarios FROM usuarios")
        .then(function (r) {
            dados.total_usuarios = r[0].total_usuarios;
            // Total de quizzes
            return db.executar("SELECT COUNT(*) AS total_quizzes FROM quiz_respostas");
        })
        .then(function (r) {
            dados.total_quizzes = r[0].total_quizzes;
            // Pontuação média
            return db.executar("SELECT ROUND(AVG(pontuacao), 1) AS media FROM quiz_respostas");
        })
        .then(function (r) {
            dados.media_pontuacao = r[0].media || 0;
            // Distribuição por perfil
            return db.executar(
                "SELECT perfil, COUNT(*) AS quantidade FROM quiz_respostas GROUP BY perfil"
            );
        })
        .then(function (r) {
            dados.perfis = r;
            // Motivações mais citadas
            return db.executar(
                "SELECT motivacao, COUNT(*) AS quantidade FROM quiz_respostas " +
                "WHERE motivacao IS NOT NULL GROUP BY motivacao ORDER BY quantidade DESC LIMIT 5"
            );
        })
        .then(function (r) {
            dados.motivacoes = r;
            // Estilos preferidos
            return db.executar(
                "SELECT estilo, COUNT(*) AS quantidade FROM quiz_respostas " +
                "WHERE estilo IS NOT NULL GROUP BY estilo ORDER BY quantidade DESC"
            );
        })
        .then(function (r) {
            dados.estilos = r;
            //  Cadastros por mês (últimos 6 meses)
            return db.executar(
                "SELECT DATE_FORMAT(criado, '%Y-%m') AS mes, COUNT(*) AS quantidade " +
                "FROM usuarios " +
                "WHERE criado >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                "GROUP BY mes ORDER BY mes ASC"
            );
        })
        .then(function (r) {
            dados.cadastros_por_mes = r;

            return res.status(200).json({
                kpis: {
                    total_usuarios: dados.total_usuarios,
                    total_quizzes: dados.total_quizzes,
                    media_pontuacao: dados.media_pontuacao
                },
                graficos: {
                    perfis: dados.perfis,
                    motivacoes: dados.motivacoes,
                    estilos: dados.estilos,
                    cadastros_por_mes: dados.cadastros_por_mes
                }
            });
        })
        .catch(function (erro) {
            console.error("Erro ao carregar dashboard:", erro);
            return res.status(500).json({ mensagem: "Erro interno no servidor." });
        });
});

module.exports = router;