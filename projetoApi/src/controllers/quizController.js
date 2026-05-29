var quizModel = require("../models/quizModel");

function salvar(req, res) {
    console.log("BODY:", req.body);
    console.log("fkUsuario:", req.body.fkUsuario);
    console.log("perfil:",    req.body.perfil);
    console.log("pontuacao:", req.body.pontuacao);

    var fkUsuario = req.body.fkUsuario;
    var perfil    = req.body.perfil;
    var pontuacao = req.body.pontuacao;
    var cenario   = req.body.cenario;
    var estilo    = req.body.estilo;
    var reacao    = req.body.reacao;
    var motivacao = req.body.motivacao;

    if (!fkUsuario || !perfil || pontuacao === undefined) {
        return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    quizModel.salvarResultado(fkUsuario, perfil, pontuacao, cenario, estilo, reacao, motivacao)
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

//  busca os dados agregados do banco para montar o dashboard pela primeira vez.
function dashboard(req, res) {
    var dados = {};

    quizModel.buscarDashboard()
        .then(function (r) {
            dados.kpis = {
                total_quizzes:   r[0].total_quizzes,
                total_usuarios:  r[0].total_usuarios,
                media_pontuacao: r[0].media_pontuacao || 0
            };
            return quizModel.buscarPerfis();
        })
        .then(function (r) {
            dados.perfis = r;
            return quizModel.buscarMotivacoes();
        })
        .then(function (r) {
            dados.motivacoes = r;
            return quizModel.buscarEstilos();
        })
        .then(function (r) {
            dados.estilos = r;
            return quizModel.buscarCadastrosPorSemana();
        })
        .then(function (r) {
            dados.cadastros_por_mes = r;

            console.log("Recuperando dados do dashboard completos");

            res.status(200).json({
                kpis: dados.kpis,
                graficos: {
                    perfis:           dados.perfis,
                    motivacoes:       dados.motivacoes,
                    estilos:          dados.estilos,
                    cadastros_por_mes: dados.cadastros_por_mes
                }
            });
        })
        .catch(function (erro) {
            console.error("Erro ao carregar dashboard:", erro);
            res.status(500).json({ mensagem: erro.sqlMessage || "Erro interno no servidor." });
        });
}

// retorna apenas os campos necessários para detectar
// se houve novos registros desde a última renderização do dashboard
function dashboardTempoReal(req, res) {

    console.log("Recuperando dados do dashboard em tempo real");

    quizModel.buscarDashboardEmTempoReal()
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os dados em tempo real.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
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

function dadosUsuario(req, res) {
    var fkUsuario = req.params.fkUsuario;

    if (!fkUsuario) {
        return res.status(400).json({ mensagem: "Usuário não informado." });
    }

    console.log("Recuperando dados pessoais do usuario " + fkUsuario);

    quizModel.buscarDadosUsuario(fkUsuario)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os dados do usuario.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    salvar,
    dashboard,
    dashboardTempoReal,
    historico
};
