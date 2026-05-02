var quizModel = require("../models/quizModel");

function salvar(req, res) {
    var fkUsuario = req.body.fkUsuario;
    var perfil = req.body.perfil;
    var pontuacao = req.body.pontuacao;
    var cenario = req.body.cenario;
    var estilo = req.body.estilo;
    var reacao = req.body.reacao;
    var motivacao = req.body.motivacao;

    quizModel.salvarResultado(
        fkUsuario,
        perfil,
        pontuacao,
        cenario,
        estilo,
        reacao,
        motivacao
    )
    .then(function () {
        res.status(200).json({ mensagem: "Resultado salvo com sucesso" });
    })
    .catch(function (erro) {
        res.status(500).json(erro.sqlMessage);
    });
}

function dashboard(req, res) {
    quizModel.buscarDashboard()
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            res.status(500).json(erro.sqlMessage);
        });
}

function historico(req, res) {
    var fkUsuario = req.params.fkUsuario;

    quizModel.buscarHistorico(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    salvar,
    dashboard,
    historico
};