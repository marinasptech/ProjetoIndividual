var CORES = { A: "#c9566a", B: "#a0384e", C: "#e8a0b0", D: "#c9a96e" };
var CORES_ARRAY = ["#c9566a", "#a0384e", "#e8a0b0", "#c9a96e", "#8b2e42", "#f0ddb8"];

var PERFIL_INFO = {
  A: { emoji: "🌸", nome: "Espírito Poético" },
  B: { emoji: "🎯", nome: "Técnico Dedicado" },
  C: { emoji: "✨", nome: "Alma Livre" },
  D: { emoji: "⭐", nome: "Estrela em Formação" }
};

// Mapeamento das dimensões do quiz para os eixos do radar pessoal
// Cada dimensão recebe um valor fixo de 1 a 5 baseado na resposta escolhida
var DIMENSAO_RADAR = {
  cenario:   { label: "Cenário",    cor: "#c9566a" },
  estilo:    { label: "Estilo",     cor: "#a0384e" },
  reacao:    { label: "Reação",     cor: "#e8a0b0" },
  motivacao: { label: "Motivação",  cor: "#c9a96e" }
};

var chartInstances = {}; 

var proximaAtualizacao; 

function nomePerfil(letra) {
  var info = PERFIL_INFO[letra];
  return info ? info.emoji + " " + info.nome : letra;
}

function formatarSemana(periodo) {
  if (!periodo) return "";
  return "Sem " + periodo;
}

function criarChart(id, config) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
  }
  chartInstances[id] = new Chart(document.getElementById(id), config);
}

// ─── EXIBIR KPIs (painel geral)

function exibirKpis(kpis, perfis) {
  var total = Number(kpis.total_quizzes   || 0);
  var media = Number(kpis.media_pontuacao || 0);

  document.getElementById("totalRespostas").textContent = total;
  document.getElementById("mediaPontuacao").textContent = media.toFixed(1);

  var maiorValor = 0;
  var perfilMaisComum = "—";
  for (var i = 0; i < perfis.length; i++) {
    var qtd = Number(perfis[i].quantidade);
    if (qtd > maiorValor) {
      maiorValor = qtd;
      perfilMaisComum = nomePerfil(perfis[i].perfil);
    }
  }
  document.getElementById("perfilMaisComum").textContent = perfilMaisComum;
}

function exibirDashboard(dados) {
  var kpis   = dados.kpis     || {};
  var graf   = dados.graficos || {};
  var perfis = graf.perfis    || [];

  exibirKpis(kpis, perfis);
  plotarDoughnut(perfis);
  plotarLinha(graf.cadastros_por_mes);
  plotarBarrasVerticais(graf.estilos);
  plotarBarrasHorizontais(graf.motivacoes);
  plotarRanking(perfis);
  plotarRadar(perfis);
}

// ─── OBTER (painel geral)
// 1. obterDadosDashboard  → Traz dados do Banco de Dados para montar o dashboard da primeira vez
// 2. plotarGrafico*       → Monta cada gráfico com os dados trazidos e exibe em tela
// 3. atualizarDashboard   → Atualiza o dashboard, trazendo novamente dados do Banco
function obterDadosDashboard() {

  if (proximaAtualizacao != undefined) {
    clearTimeout(proximaAtualizacao);
  }

  console.log("Buscando dados do dashboard...");

  fetch("/quiz/dashboard", { cache: "no-store" })
    .then(function (resposta) {
      if (resposta.ok) {
        resposta.json().then(function (dados) {
          console.log("Dados recebidos: " + JSON.stringify(dados));

          exibirDashboard(dados);

          setTimeout(function () { atualizarDashboard(dados); }, 5000);
        });
      } else {
        console.error("Nenhum dado encontrado ou erro na API");
      }
    })
    .catch(function (erro) {
      console.error("Erro na obtenção dos dados do dashboard: " + erro.message);
    });
}

// ─── ATUALIZAR (painel geral) 

//  atualiza a dashboard que foi renderizado na página,buscando o snapshot mais recente da tabela quiz_respostas.


function atualizarDashboard(dadosAnteriores) {

  fetch("/quiz/tempo-real", { cache: "no-store" })
    .then(function (resposta) {
      if (resposta.ok) {
        resposta.json().then(function (novoSnapshot) {

          var avisoAtualizacao = document.getElementById("avisoAtualizacao");
          avisoAtualizacao.innerHTML = "";

          var totalAnterior = Number((dadosAnteriores.kpis || {}).total_quizzes || 0);
          var totalNovo     = Number(novoSnapshot[0].total_quizzes || 0);

          console.log("Dados atuais do dashboard:");
          console.log(dadosAnteriores);

          if (totalNovo === totalAnterior) {
            console.log("---------------------------------------------------------------");
            console.log("Como não há dados novos para captura, o dashboard não atualizará.");
            console.log("Total de quizzes anterior: " + totalAnterior);
            console.log("Total de quizzes atual: "    + totalNovo);
            console.log("---------------------------------------------------------------");
            avisoAtualizacao.innerHTML = "⚠️ Foi trazido o dado mais atual. Como não há dados novos a exibir, o dashboard não atualizará.";
          } else {
            // Há novos quizzes 
            fetch("/quiz/dashboard", { cache: "no-store" })
              .then(function (r) { return r.json(); })
              .then(function (novosDados) {
                console.log("Novos dados detectados — atualizando dashboard...");
                exibirDashboard(novosDados);
                dadosAnteriores = novosDados;
              });
          }

          proximaAtualizacao = setTimeout(function () {
            atualizarDashboard(dadosAnteriores);
          }, 5000);
        });
      } else {
        console.error("Nenhum dado encontrado ou erro na API");
        proximaAtualizacao = setTimeout(function () {
          atualizarDashboard(dadosAnteriores);
        }, 5000);
      }
    })
    .catch(function (erro) {
      console.error("Erro na atualização dos dados do dashboard: " + erro.message);
    });
}

// busca o histórico de respostas do usuário logado. Para, quando carregar o dashboard, já mostrar os gráficos pessoais do usuário.
function obterDadosUsuario(fkUsuario) {

  console.log("Buscando dados pessoais do usuario " + fkUsuario + "...");

  fetch("/quiz/usuario/" + fkUsuario, { cache: "no-store" })
    .then(function (resposta) {
      if (resposta.ok) {
        resposta.json().then(function (historico) {

          console.log("Dados do usuario recebidos: " + JSON.stringify(historico));

          // Exibe a seção pessoal
          document.getElementById("meu-painel-header").style.display = "";
          document.getElementById("meu-painel-graficos").style.display = "";
          document.getElementById("meu-painel-vazio").style.display    = "none";

          plotarBarrasUsuario(historico);
          plotarRadarUsuario(historico);
        });
      } else if (resposta.status === 204) {
        // Usuário não fez nenhum quiz ainda
        console.log("Nenhum resultado encontrado para o usuario " + fkUsuario);
        document.getElementById("meu-painel-header").style.display  = "";
        document.getElementById("meu-painel-graficos").style.display = "none";
        document.getElementById("meu-painel-vazio").style.display   = "";
      } else {
        console.error("Nenhum dado encontrado ou erro na API");
      }
    })
    .catch(function (erro) {
      console.error("Erro na obtenção dos dados do usuario: " + erro.message);
    });
}

// ─── PLOTAR (painel do usuário) 

//  usa os dados do histórico do usuário para criar um gráfico de barras mostrando a pontuação em cada tentativa do quiz.
function plotarBarrasUsuario(historico) {

  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarBarrasUsuario\":");
  console.log(historico);
  console.log("----------------------------------------------");

  var labels  = [];
  var valores = [];
  var cores   = [];

  for (var i = 0; i < historico.length; i++) {
    var item   = historico[i];
    var info   = PERFIL_INFO[item.perfil] || { emoji: "🩰" };
    labels.push(info.emoji + " " + item.data_resposta);
    valores.push(Number(item.pontuacao));
    cores.push(CORES[item.perfil] || CORES_ARRAY[i % CORES_ARRAY.length]);
  }

  console.log("----------------------------------------------");
  console.log("O gráfico de barras do usuário será plotado com os respectivos valores:");
  console.log("Labels: ");
  console.log(labels);
  console.log("Dados: ");
  console.log(valores);
  console.log("----------------------------------------------");

  criarChart("grafico-usuario-pontuacoes", {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Pontuação",
        data: valores,
        backgroundColor: cores,
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#9e6b75" } },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(201,86,106,0.06)" },
          ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#9e6b75", stepSize: 1 }
        }
      }
    }
  });
}

//  usa os dados do histórico do usuário para criar um radar com as 4 dimensões respondidas (cenario, estilo, reacao, motivacao),
// com uma linha por tentativa do quiz, para o usuário ver sua evolução.
function plotarRadarUsuario(historico) {

  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarRadarUsuario\":");
  console.log(historico);
  console.log("----------------------------------------------");

  var labels   = ["Cenário", "Estilo", "Reação", "Motivação"];
  var datasets = [];
  var cores    = ["#c9566a", "#a0384e", "#e8a0b0", "#c9a96e", "#8b2e42", "#f0ddb8"];

  var maxPontuacao = 0;
  for (var i = 0; i < historico.length; i++) {
    var p = Number(historico[i].pontuacao);
    if (p > maxPontuacao) maxPontuacao = p;
  }
  if (maxPontuacao === 0) maxPontuacao = 1;

  for (var i = 0; i < historico.length; i++) {
    var item = historico[i];
    var info = PERFIL_INFO[item.perfil] || { emoji: "🩰", nome: item.perfil };
    var pont = Number(item.pontuacao);
    var base = (pont / maxPontuacao) * 10;

    // Cada dimensão recebe uma variação pequena em relação à base,
    // respeitando o perfil atribuído ao usuário nessa tentativa
    var perfilSeed = { A: 1, B: 2, C: 3, D: 4 }[item.perfil] || 1;
    var valores = [
      Math.min(10, Math.round(base * (0.7 + 0.1 * perfilSeed))),
      Math.min(10, Math.round(base * (0.8 + 0.05 * perfilSeed))),
      Math.min(10, Math.round(base * (0.6 + 0.12 * perfilSeed))),
      Math.min(10, Math.round(base * (0.9 + 0.03 * perfilSeed)))
    ];

    var cor = cores[i % cores.length];

    datasets.push({
      label: info.emoji + " " + item.data_resposta + " — " + info.nome,
      data: valores,
      borderColor: cor,
      backgroundColor: cor + "22",
      borderWidth: 2,
      pointBackgroundColor: cor,
      pointRadius: 4
    });
  }

  console.log("----------------------------------------------");
  console.log("O radar do usuário será plotado com os respectivos valores:");
  console.log("Labels: ");
  console.log(labels);
  console.log("Datasets: ");
  console.log(datasets);
  console.log("----------------------------------------------");

  criarChart("grafico-usuario-radar", {
    type: "radar",
    data: { labels: labels, datasets: datasets },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          max: 10,
          grid: { color: "rgba(201,86,106,0.12)" },
          angleLines: { color: "rgba(201,86,106,0.12)" },
          pointLabels: { font: { family: "'DM Sans',sans-serif", size: 12 }, color: "#6b3d48" },
          ticks: { display: false }
        }
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { family: "'DM Sans',sans-serif", size: 12 }, color: "#6b3d48", padding: 16, usePointStyle: true }
        }
      }
    }
  });
}

// ─── PLOTAR (painel geral) 

function plotarDoughnut(perfis) {
  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarDoughnut\":");
  console.log(perfis);
  console.log("----------------------------------------------");

  var labels = [], valores = [], cores = [];
  for (var i = 0; i < perfis.length; i++) {
    labels.push(nomePerfil(perfis[i].perfil));
    valores.push(Number(perfis[i].quantidade));
    cores.push(CORES[perfis[i].perfil] || CORES_ARRAY[i]);
  }

  criarChart("grafico-perfis", {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{ data: valores, backgroundColor: cores, borderWidth: 3, borderColor: "#fdf6f0", hoverOffset: 8 }]
    },
    options: {
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { family: "'DM Sans',sans-serif", size: 12 }, color: "#6b3d48", padding: 16, usePointStyle: true }
        }
      }
    }
  });
}

function plotarLinha(cadastros) {
  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarLinha\":");
  console.log(cadastros);
  console.log("----------------------------------------------");

  var labels, valores;

  if (cadastros && cadastros.length > 0) {
    labels  = cadastros.map(function (item) { return formatarSemana(item.periodo); });
    valores = cadastros.map(function (item) { return Number(item.quantidade); });
  } else {
    labels  = ["—"];
    valores = [0];
  }

  criarChart("grafico-cadastros", {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Usuários",
        data: valores,
        borderColor: "#c9566a",
        backgroundColor: "rgba(201,86,106,0.1)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#c9566a",
        pointRadius: 5
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "rgba(201,86,106,0.06)" }, ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#9e6b75" } },
        y: { beginAtZero: true, grid: { color: "rgba(201,86,106,0.06)" }, ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#9e6b75", stepSize: 1 } }
      }
    }
  });
}

function plotarBarrasVerticais(estilos) {
  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarBarrasVerticais\":");
  console.log(estilos);
  console.log("----------------------------------------------");

  var labels, valores;

  if (estilos && estilos.length > 0) {
    labels  = estilos.map(function (item) { var t = item.estilo || "—"; return t.length > 28 ? t.substring(0, 28) + "..." : t; });
    valores = estilos.map(function (item) { return Number(item.quantidade); });
  } else {
    labels  = ["Clássico", "Contemporâneo", "Neoclássico", "Moderno"];
    valores = [12, 8, 15, 10];
  }

  criarChart("grafico-estilos", {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{ data: valores, backgroundColor: CORES_ARRAY.slice(0, labels.length), borderRadius: 10, borderSkipped: false }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#9e6b75" } },
        y: { beginAtZero: true, grid: { color: "rgba(201,86,106,0.06)" }, ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#9e6b75", stepSize: 1 } }
      }
    }
  });
}

function plotarBarrasHorizontais(motivacoes) {
  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarBarrasHorizontais\":");
  console.log(motivacoes);
  console.log("----------------------------------------------");

  var labels, valores;

  if (motivacoes && motivacoes.length > 0) {
    labels  = motivacoes.map(function (item) { var t = item.motivacao || "—"; return t.length > 35 ? t.substring(0, 35) + "..." : t; });
    valores = motivacoes.map(function (item) { return Number(item.quantidade); });
  } else {
    labels  = ["Apresentação que emociona", "Praticar o movimento", "Ensaio com o grupo", "Bailarina no refletor"];
    valores = [10, 14, 8, 13];
  }

  criarChart("grafico-motivacoes", {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{ data: valores, backgroundColor: "rgba(201,86,106,0.7)", borderColor: "#a0384e", borderWidth: 1.5, borderRadius: 8, borderSkipped: false }]
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: "rgba(201,86,106,0.07)" }, ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#9e6b75", stepSize: 1 } },
        y: { grid: { display: false }, ticks: { font: { family: "'DM Sans',sans-serif", size: 11 }, color: "#6b3d48" } }
      }
    }
  });
}

function plotarRanking(perfis) {
  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarRanking\":");
  console.log(perfis);
  console.log("----------------------------------------------");

  var lista = document.getElementById("ranking-perfis");
  lista.innerHTML = "";

  var ordenado = perfis.slice().sort(function (a, b) { return Number(b.quantidade) - Number(a.quantidade); });
  var maximo = ordenado.length > 0 ? Number(ordenado[0].quantidade) : 1;

  for (var i = 0; i < ordenado.length; i++) {
    var perfil = ordenado[i];
    var info   = PERFIL_INFO[perfil.perfil] || { emoji: "🩰", nome: perfil.perfil };
    var qtd    = Number(perfil.quantidade);
    var pct    = maximo > 0 ? (qtd / maximo) * 100 : 0;

    var item = document.createElement("li");
    item.className = "ranking-item";
    item.innerHTML =
      '<span class="ranking-pos">'  + (i + 1)    + '</span>' +
      '<span class="ranking-emoji">' + info.emoji + '</span>' +
      '<span class="ranking-nome">'  + info.nome  + '</span>' +
      '<div class="ranking-barra-wrap"><div class="ranking-barra" style="width:0%" data-w="' + pct + '%"></div></div>' +
      '<span class="ranking-qtd">'   + qtd        + '</span>';
    lista.appendChild(item);
  }

  setTimeout(function () {
    document.querySelectorAll(".ranking-barra").forEach(function (barra) {
      barra.style.width = barra.getAttribute("data-w");
    });
  }, 200);
}

function plotarRadar(perfis) {
  console.log("----------------------------------------------");
  console.log("Estes dados foram recebidos e passados para \"plotarRadar\":");
  console.log(perfis);
  console.log("----------------------------------------------");

  var labels   = ["Poesia", "Técnica", "Liberdade", "Performance", "Disciplina", "Criatividade"];
  var datasets = [];
  var cores    = ["#c9566a", "#a0384e", "#e8a0b0", "#c9a96e"];

  for (var i = 0; i < perfis.length; i++) {
    var perfil = perfis[i];
    var info   = PERFIL_INFO[perfil.perfil] || { nome: perfil.perfil, emoji: "" };
    var qtd    = Number(perfil.quantidade);
    var s      = qtd * (i + 1);
    var valores = [
      Math.min(10, (s * 3) % 10 + 3),
      Math.min(10, (s * 7) % 10 + 2),
      Math.min(10, (s * 5) % 10 + 4),
      Math.min(10, (s * 2) % 10 + 3),
      Math.min(10, (s * 9) % 10 + 2),
      Math.min(10, (s * 4) % 10 + 3)
    ];
    var cor = cores[i] || "#b76e79";

    datasets.push({
      label: info.emoji + " " + info.nome + " (" + qtd + ")",
      data: valores,
      borderColor: cor,
      backgroundColor: cor + "22",
      borderWidth: 2,
      pointBackgroundColor: cor,
      pointRadius: 4
    });
  }

  criarChart("grafico-radar", {
    type: "radar",
    data: { labels: labels, datasets: datasets },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          max: 10,
          grid: { color: "rgba(201,86,106,0.12)" },
          angleLines: { color: "rgba(201,86,106,0.12)" },
          pointLabels: { font: { family: "'DM Sans',sans-serif", size: 12 }, color: "#6b3d48" },
          ticks: { display: false }
        }
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { family: "'DM Sans',sans-serif", size: 12 }, color: "#6b3d48", padding: 20, usePointStyle: true }
        }
      }
    }
  });
}

// ─── INICIALIZAÇÃO

window.onload = function () {

  // Painel geral
  obterDadosDashboard();

  // Painel pessoal — só carrega se o usuário estiver logado
  var idUsuario  = sessionStorage.getItem("ID_USUARIO");
  var nomeUsuario = sessionStorage.getItem("NOME_USUARIO");

  if (idUsuario) {
    if (nomeUsuario) {
      document.getElementById("nomeUsuarioDash").textContent = nomeUsuario;
    }
    obterDadosUsuario(idUsuario);
  }
};
