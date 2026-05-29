var express = require("express");
var router  = express.Router();

var quizController = require("../controllers/quizController");

// POST /quiz — Salva respostas do quiz
router.post("/", function (req, res) {
    quizController.salvar(req, res);
});

// GET /quiz/dashboard — Dados completos para montar dash
router.get("/dashboard", function (req, res) {
    quizController.dashboard(req, res);
});

// GET /quiz/tempo-real 
router.get("/tempo-real", function (req, res) {
    quizController.dashboardTempoReal(req, res);
});

// GET /quiz/usuario/:fkUsuario — Histórico completo de um usuário para os gráficos pessoais
router.get("/usuario/:fkUsuario", function (req, res) {
    quizController.dadosUsuario(req, res);
});

// GET /quiz/historico/:fkUsuario — Histórico de respostas de um usuário
router.get("/historico/:fkUsuario", function (req, res) {
    quizController.historico(req, res);
});

module.exports = router;
