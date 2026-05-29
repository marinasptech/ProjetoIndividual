

var tentativas = 0;

function mostrarErro(mensagem) {
    var caixaErro    = cardErro;
    var textoErro    = mensagem_erro;
    var caixaSucesso = cardSucesso;

    textoErro.innerHTML        = mensagem;
    caixaErro.style.display    = "block";
    caixaSucesso.style.display = "none";
}

function mostrarSucesso(mensagem) {
    var caixaSucesso = cardSucesso;
    var textoSucesso = mensagem_sucesso;
    var caixaErro    = cardErro;

    textoSucesso.innerHTML     = mensagem;
    caixaSucesso.style.display = "block";
    caixaErro.style.display    = "none";
}

function cadastrar() {
    var nome     = idNome.value;
    var email    = idEmail.value;
    var senha    = idSenha.value;
    var confirma = idConfirmaSenha.value;

    // Validações — verifica cada campo antes de enviar
    if (nome === "" || email === "" || senha === "" || confirma === "") {
        mostrarErro("Preencha todos os campos.");
        return;
    }

    if (nome.length <= 2) {
        mostrarErro("Nome deve ter mais de 2 caracteres.");
        return;
    }

    if (email.includes("@") == false || email.includes(".com") == false) {
        mostrarErro("E-mail inválido.");
        return;
    }

    if (senha.length <= 6) {
        mostrarErro("Senha deve ter mais de 6 caracteres.");
        return;
    }

    if (senha !== confirma) {
        mostrarErro("As senhas não coincidem.");
        return;
    }

    var corpo = {
        nome:  nome,
        email: email,
        senha: senha
    };

    // Envia para a API via fetch
    fetch( "/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    })
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {
        if (dados.id) {
            mostrarSucesso("Cadastro realizado! Redirecionando...");
            setTimeout(function () {
                window.location.href = "login.html";
            }, 1500);
        } else {
            mostrarErro(dados.mensagem);
        }
    })
    .catch(function () {
        mostrarErro("Não foi possível conectar ao servidor.");
    });
}

function validarSessao() {
    var email = idEmail.value;
    var senha = idSenha.value;

    // Bloqueia se já errou 3 vezes
    if (tentativas >= 3) {
        mostrarErro("Acesso bloqueado. Número máximo de tentativas atingido.");
        return;
    }

    if (email === "" || senha === "") {
        mostrarErro("Preencha e-mail e senha.");
        return;
    }

    var corpo = {
        email: email,
        senha: senha
    };

    fetch("/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    })
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {
        if (dados.token) {
            sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));

            mostrarSucesso("Login realizado! Redirecionando...");
            setTimeout(function () {
                window.location.href = "quiz.html";
            }, 1500);

        } else {
            tentativas = tentativas + 1;

            var restantes = 3 - tentativas;
            var spanTentativas = tentativas;

            if (tentativas >= 3) {
                spanTentativas.textContent = "Acesso bloqueado!";
                mostrarErro("Você excedeu o número de tentativas.");
            } else {
                spanTentativas.textContent = "Tentativas restantes: " + restantes;
                mostrarErro(dados.mensagem);
            }
        }
    })
    .catch(function () {
        mostrarErro("Não foi possível conectar ao servidor.");
    });
}

function limparSessao() {
    sessionStorage.clear();
    window.location.href = "login.html";
}