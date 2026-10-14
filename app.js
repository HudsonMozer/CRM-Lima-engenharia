
const menuItems = document.querySelectorAll(".menu-item");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("page-title");

function navegarPara(paginaId) {
    const paginaSelecionada = document.getElementById(paginaId);

    if (!paginaSelecionada) {
        return;
    }

    pages.forEach(function (pagina) {
        pagina.hidden = pagina.id !== paginaId;
    });

    menuItems.forEach(function (item) {
        const destino = item.getAttribute("href").substring(1);
        item.classList.toggle("active", destino === paginaId);
    });

    const itemAtivo = document.querySelector(
        '.menu-item[href="#' + paginaId + '"]'
    );

    if (itemAtivo) {
        pageTitle.textContent = itemAtivo.textContent.trim();
    }

    window.scrollTo(0, 0);
}

menuItems.forEach(function (item) {
    item.addEventListener("click", function (evento) {
        evento.preventDefault();

        const paginaId = item.getAttribute("href").substring(1);

        navegarPara(paginaId);
        window.location.hash = paginaId;
    });
});

window.addEventListener("hashchange", function () {
    const paginaId = window.location.hash.substring(1);

    if (paginaId) {
        navegarPara(paginaId);
    }
});

const paginaInicial = window.location.hash.substring(1);

navegarPara(paginaInicial || "dashboard");

const formCliente = document.getElementById("formCliente");
const formularioCliente = document.getElementById("formularioCliente");
const listaClientes = document.getElementById("listaClientes");
const totalClientes = document.getElementById("totalClientes");
const estadoVazio = document.getElementById("estadoVazio");
const pesquisaCliente = document.getElementById("pesquisaCliente");

let clientes = JSON.parse(localStorage.getItem("crm_clientes")) || [];

let proximoId = Number(localStorage.getItem("crm_proximo_id")) || 1;

function salvarClientes() {
    localStorage.setItem("crm_clientes", JSON.stringify(clientes));
    localStorage.setItem("crm_proximo_id", String(proximoId));
}

document.getElementById("btnNovoCliente").addEventListener("click", function () {
    formCliente.reset();

    document.getElementById("clienteId").value = "";
    document.getElementById("tituloFormulario").textContent = "Novo cliente";

    formularioCliente.hidden = false;
    document.getElementById("nome").focus();
});

document.getElementById("btnCancelar").addEventListener("click", function () {
    formularioCliente.hidden = true;
    formCliente.reset();
});

formCliente.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const id = document.getElementById("clienteId").value;

    const cliente = {
        nome: document.getElementById("nome").value.trim(),
        tipo: document.getElementById("tipo").value,
        documento: document.getElementById("documento").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        cidade: document.getElementById("cidade").value.trim()
    };

    if (!cliente.nome || !cliente.tipo || !cliente.telefone) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    if (id) {
        const indice = clientes.findIndex(function (item) {
            return item.id === Number(id);
        });

        if (indice !== -1) {
            clientes[indice] = {
                ...clientes[indice],
                ...cliente
            };
        }
    } else {
        clientes.push({
            id: proximoId++,
            ...cliente
        });
    }

    salvarClientes();

    formCliente.reset();
    formularioCliente.hidden = true;
    renderizarClientes();
});

function renderizarClientes() {
    const termo = pesquisaCliente.value.trim().toLowerCase();

    const filtrados = clientes.filter(function (cliente) {
        return [
            cliente.nome,
            cliente.documento,
            cliente.telefone
        ].some(function (valor) {
            return valor.toLowerCase().includes(termo);
        });
    });

    listaClientes.replaceChildren();

    filtrados.forEach(function (cliente) {
        const linha = document.createElement("tr");

        const valores = [
            cliente.nome,
            cliente.tipo,
            cliente.telefone,
            cliente.cidade || "—"
        ];

        valores.forEach(function (valor) {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaAcoes = document.createElement("td");
        const botaoEditar = document.createElement("button");

        botaoEditar.type = "button";
        botaoEditar.className = "table-action";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", function () {
            editarCliente(cliente.id);
        });

        celulaAcoes.appendChild(botaoEditar);
        linha.appendChild(celulaAcoes);

        listaClientes.appendChild(linha);
    });

    totalClientes.textContent =
        clientes.length + (clientes.length === 1 ? " cliente" : " clientes");

    estadoVazio.hidden = filtrados.length > 0;

    if (clientes.length > 0 && filtrados.length === 0) {
        estadoVazio.textContent = "Nenhum cliente corresponde à pesquisa.";
    } else {
        estadoVazio.textContent = "Nenhum cliente cadastrado ainda.";
    }
}

function editarCliente(id) {
    const cliente = clientes.find(function (item) {
        return item.id === id;
    });

    if (!cliente) {
        return;
    }

    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("nome").value = cliente.nome;
    document.getElementById("tipo").value = cliente.tipo;
    document.getElementById("documento").value = cliente.documento;
    document.getElementById("telefone").value = cliente.telefone;
    document.getElementById("email").value = cliente.email;
    document.getElementById("cidade").value = cliente.cidade;

    document.getElementById("tituloFormulario").textContent = "Editar cliente";
    formularioCliente.hidden = false;

    document.getElementById("nome").focus();
}

pesquisaCliente.addEventListener("input", renderizarClientes);

renderizarClientes();