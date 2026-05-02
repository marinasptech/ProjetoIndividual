var database = require("../database/config");

function salvarResultado(fkUsuario, perfil, pontuacao, cenario, estilo, reacao, motivacao) {
    var instrucaoSql = `
        INSERT INTO quiz_respostas
        (fkUsuario, perfil, pontuacao, cenario, estilo, reacao, motivacao)
        VALUES
        (${fkUsuario}, '${perfil}', ${pontuacao}, '${cenario}', '${estilo}', '${reacao}', '${motivacao}');
    `;

    return database.executar(instrucaoSql);
}

function buscarDashboard() {
    var instrucaoSql = `
        SELECT perfil, COUNT(*) AS total
        FROM quiz_respostas
        GROUP BY perfil;
    `;

    return database.executar(instrucaoSql);
}

function buscarHistorico(fkUsuario) {
    var instrucaoSql = `
        SELECT *
        FROM quiz_respostas
        WHERE fkUsuario = ${fkUsuario}
        ORDER BY respondido DESC;
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    salvarResultado,
    buscarDashboard,
    buscarHistorico
};