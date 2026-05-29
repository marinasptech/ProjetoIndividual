var db = require("../database/config");

function salvarResultado(fkUsuario, perfil, pontuacao, cenario, estilo, reacao, motivacao) {
    var instrucaoSql = `
        INSERT INTO quiz_respostas
        (fkUsuario, perfil, pontuacao, cenario, estilo, reacao, motivacao)
        VALUES
        (${fkUsuario}, '${perfil}', ${pontuacao}, '${cenario}', '${estilo}', '${reacao}', '${motivacao}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

// retorna os dados agregados do banco para montar o dashboard pela primeira vez 
function buscarDashboard() {
    var instrucaoSql = `
        SELECT
            (SELECT COUNT(*) FROM quiz_respostas)                        AS total_quizzes,
            (SELECT COUNT(*) FROM usuarios)                              AS total_usuarios,
            (SELECT ROUND(AVG(pontuacao), 1) FROM quiz_respostas)        AS media_pontuacao
    `;

    console.log("Executando a instrução SQL (KPIs): \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

// busca o snapshot mais recente do banco para detectar se houve novos registros desde a última atualização do dashboard.
function buscarDashboardEmTempoReal() {
    var instrucaoSql = `
        SELECT
            COUNT(*)                       AS total_quizzes,
            ROUND(AVG(pontuacao), 1)       AS media_pontuacao,
            MAX(respondido)                AS ultimo_registro
        FROM quiz_respostas
    `;

    console.log("Executando a instrução SQL (tempo real): \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

function buscarPerfis() {
    var instrucaoSql = `
        SELECT perfil, COUNT(*) AS quantidade
        FROM quiz_respostas
        GROUP BY perfil
    `;

    console.log("Executando a instrução SQL (perfis): \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

function buscarMotivacoes() {
    var instrucaoSql = `
        SELECT motivacao, COUNT(*) AS quantidade
        FROM quiz_respostas
        WHERE motivacao IS NOT NULL
        GROUP BY motivacao
        ORDER BY quantidade DESC
        LIMIT 5
    `;

    console.log("Executando a instrução SQL (motivacoes): \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

function buscarEstilos() {
    var instrucaoSql = `
        SELECT estilo, COUNT(*) AS quantidade
        FROM quiz_respostas
        WHERE estilo IS NOT NULL
        GROUP BY estilo
        ORDER BY quantidade DESC
    `;

    console.log("Executando a instrução SQL (estilos): \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

function buscarCadastrosPorSemana() {
    var instrucaoSql = `
        SELECT
            YEARWEEK(criado, 1)                         AS periodo,
            MIN(DATE_FORMAT(criado, '%Y-%m-%d'))        AS inicio_semana,
            COUNT(*)                                    AS quantidade
        FROM usuarios
        WHERE criado >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
        GROUP BY periodo
        ORDER BY periodo ASC
    `;

    console.log("Executando a instrução SQL (cadastros por semana): \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

function buscarHistorico(fkUsuario) {
    var instrucaoSql = `
        SELECT *
        FROM quiz_respostas
        WHERE fkUsuario = ${fkUsuario}
        ORDER BY respondido DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

// Esta função *buscarDadosUsuario* retorna o histórico completo de respostas de um usuario
// É usada para montar os gráficos pessoais do usuário logado no dashboard.
function buscarDadosUsuario(fkUsuario) {
    var instrucaoSql = `
        SELECT
            perfil,
            pontuacao,
            cenario,
            estilo,
            reacao,
            motivacao,
            DATE_FORMAT(respondido, '%d/%m/%Y') AS data_resposta
        FROM quiz_respostas
        WHERE fkUsuario = ${fkUsuario}
        ORDER BY respondido ASC
    `;

    console.log("Executando a instrução SQL (dados do usuario): \n" + instrucaoSql);
    return db.executar(instrucaoSql);
}

module.exports = {
    salvarResultado,
    buscarDashboard,
    buscarDashboardEmTempoReal,
    buscarPerfis,
    buscarMotivacoes,
    buscarEstilos,
    buscarCadastrosPorSemana,
    buscarHistorico,
    buscarDadosUsuario
};
