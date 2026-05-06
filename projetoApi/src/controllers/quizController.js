var quizModel = require("../models/quizModel");

function salvar(req, res) {
    console.log("BODY:", req.body);
    console.log("fkUsuario:", req.body.fkUsuario);
    console.log("perfil:", req.body.perfil);
    console.log("pontuacao:", req.body.pontuacao);
    var fkUsuario = req.body.fkUsuario;
    var perfil    = req.body.perfil;
    var pontuacao = req.body.pontuacao;
    var cenario   = req.body.cenario;
    var estilo    = req.body.estilo;
    var reacao    = req.body.reacao;
    var motivacao = req.body.motivacao; 
    

    // Validação dos campos obrigatórios
    if (!fkUsuario || !perfil || pontuacao === undefined) {
        return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    quizModel.salvarResultado(
        fkUsuario,
        perfil,
        pontuacao,
        cenario,
        estilo,
        reacao,
        motivacao
    )
    .then(function (resultado) {
        res.status(201).json({
            mensagem: "Resultado salvo com sucesso",
            id: resultado.insertId
        });
    })
    .catch(function (erro) {
        console.error("Erro ao salvar quiz:", erro);
        res.status(500).json({ mensagem: erro.sqlMessage || "Erro interno no servidor." });
    });
}

function dashboard(req, res) {
    quizModel.buscarDashboard()
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.error("Erro ao carregar dashboard:", erro);
            res.status(500).json({ mensagem: erro.sqlMessage || "Erro interno no servidor." });
        });
}

function historico(req, res) {
    var fkUsuario = req.params.fkUsuario;

    if (!fkUsuario) {
        return res.status(400).json({ mensagem: "Usuário não informado." });
    }

    quizModel.buscarHistorico(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.error("Erro ao buscar histórico:", erro);
            res.status(500).json({ mensagem: erro.sqlMessage || "Erro interno no servidor." });
        });
}

module.exports = {
    salvar,
    dashboard,
    historico
};