const API = "http://localhost:3000/api";

const OLD_FETCH = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string') {
    if (url.includes('/api/veiculos') || url.includes('/api/motoristas')) {
      url = url.replace('http://localhost:3000', 'http://localhost:8000');
      if (!url.endsWith('/')) url += '/';
    }
  }
  return OLD_FETCH(url, options);
};

let motoristaEditandoCpf = null;
let veiculoEditandoId = null;
let manutencaoEditandoId = null;
let abastecimentoEditandoId = null;

let motoristasCache = [];
let veiculosCache = [];

document.querySelectorAll(".sidebar nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("data-target");
    showPage(target);
  });
});

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".sidebar nav a").forEach((l) => l.classList.remove("active"));

  document.getElementById(pageId).classList.add("active");
  document.querySelector(`[data-target="${pageId}"]`).classList.add("active");

  loadPageData(pageId);
}

document.getElementById("themeToggleBtn").onclick = () => {
  document.body.classList.toggle("dark");
};

async function loadMotoristasCache() {
  motoristasCache = await fetch(API + "/motoristas").then(r => r.json());
}

async function loadVeiculosCache() {
  veiculosCache = await fetch(API + "/veiculos").then(r => r.json());
}

function setupAutocomplete(inputId, listaId, getData, format) {
  const input = document.getElementById(inputId);
  const lista = document.getElementById(listaId);

  input.addEventListener("input", () => {
    const termo = input.value.toLowerCase();
    lista.innerHTML = "";

    if (!termo) {
      lista.classList.add("hidden");
      return;
    }

    const filtrados = getData().filter(item =>
      format(item).toLowerCase().includes(termo)
    );

    filtrados.forEach(item => {
      const li = document.createElement("li");
      li.textContent = format(item);

      li.onclick = () => {
        input.value = format(item);
        input.dataset.id = item.id;
        lista.classList.add("hidden");
      };

      lista.appendChild(li);
    });

    lista.classList.remove("hidden");
  });
}

function initAutocompletes() {
  // Motorista autocomplete removido

  setupAutocomplete(
    "inputVeiculoManut",
    "veiculoSugestoesManut",
    () => veiculosCache,
    (v) => `${v.placa} - ${v.modelo}`
  );

  setupAutocomplete(
    "inputVeiculoAbast",
    "veiculoSugestoesAbast",
    () => veiculosCache,
    (v) => `${v.placa} - ${v.modelo}`
  );
}

async function loadDashboard() {
  const [v, m, man, ab] = await Promise.all([
    fetch(API + "/veiculos").then(r => r.json()),
    fetch(API + "/motoristas").then(r => r.json()),
    fetch(API + "/manutencoes").then(r => r.json()),
    fetch(API + "/abastecimentos").then(r => r.json())
  ]);

  totalVeiculos.textContent = v.length;
  totalMotoristas.textContent = m.length;
  totalManutencoes.textContent = man.length;
  totalAbastecimentos.textContent = ab.length;
}

async function loadVeiculos() {
  await loadVeiculosCache();

  const list = document.getElementById("veiculosList");
  list.innerHTML = "";

  veiculosCache.forEach(v => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <p><b>${v.placa}</b> - ${v.marca || ""} ${v.modelo}</p>
      <p>Categoria: ${v.categoria || "N/A"} | Ano: ${v.ano} | KM: ${v.km}</p>
      <button onclick="editVeiculo(${v.id})">Editar</button>
      <button onclick="deleteVeiculo(${v.id})">Excluir</button>
    `;

    list.appendChild(card);
  });
}

document.getElementById("addVeiculoBtn").onclick = () => {
  veiculoEditandoId = null;
  document.getElementById("veiculoForm").classList.remove("hidden");
};

document.getElementById("cancelVeiculo").onclick = resetVeiculoForm;

document.getElementById("saveVeiculo").onclick = async () => {
  const data = {
    placa: inputValue("inputPlaca"),
    marca: inputValue("inputMarca") || null,
    modelo: inputValue("inputModelo") || null,
    categoria: inputValue("inputCategoria") || null,
    ano: inputValue("inputAno") ? Number(inputValue("inputAno")) : null,
    km: inputValue("inputKm") ? Number(inputValue("inputKm")) : 0
  };

  if (!data.placa) {
    alert("A placa do veículo é obrigatória!");
    return;
  }

  const method = veiculoEditandoId ? "PUT" : "POST";
  const url = veiculoEditandoId ? `${API}/veiculos/${veiculoEditandoId}/` : `${API}/veiculos/`;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errText = await response.text();
    alert("Erro ao salvar veículo: " + errText);
    return;
  }

  resetVeiculoForm();
  loadVeiculos();
};

function resetVeiculoForm() {
  ["inputPlaca", "inputMarca", "inputModelo", "inputCategoria", "inputAno", "inputKm"].forEach(id => {
    const el = document.getElementById(id);
    el.value = "";
    el.dataset.id = "";
  });

  document.getElementById("veiculoForm").classList.add("hidden");
}

async function editVeiculo(id) {
  const v = veiculosCache.find(v => v.id == id);

  inputPlaca.value = v.placa;
  inputMarca.value = v.marca || "";
  inputModelo.value = v.modelo;
  inputCategoria.value = v.categoria || "";
  inputAno.value = v.ano;
  inputKm.value = v.km;



  veiculoEditandoId = id;
  document.getElementById("veiculoForm").classList.remove("hidden");
}

async function deleteVeiculo(id) {
  await fetch(`${API}/veiculos/${id}`, { method: "DELETE" });
  loadVeiculos();
}

async function loadMotoristas() {
  await loadMotoristasCache();

  const list = document.getElementById("motoristasList");
  list.innerHTML = "";

  motoristasCache.forEach(m => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <p><b>${m.nome}</b> - Nasc: ${m.data_nascimento || "N/A"}</p>
      <p>CPF: ${m.cpf || "N/A"} | Telefone: ${m.telefone || "N/A"}</p>
      <p>CNH: ${m.cnh || "N/A"} | Email: ${m.email || "N/A"}</p>
      <button onclick="editMotorista('${m.cpf}')">Editar</button>
      <button onclick="deleteMotorista('${m.cpf}')">Excluir</button>
    `;

    list.appendChild(card);
  });
}

document.getElementById("addMotoristaBtn").onclick = () => {
  motoristaEditandoCpf = null;
  document.getElementById("motoristaForm").classList.remove("hidden");
};

document.getElementById("cancelMotorista").onclick = () => {
  motoristaEditandoCpf = null;
  document.getElementById("motoristaForm").classList.add("hidden");
};

document.getElementById("saveMotorista").onclick = async () => {
  const data = {
    nome: inputValue("inputNomeMotorista"),
    cpf: inputValue("inputCPF"),
    telefone: inputValue("inputTelefone") || null,
    data_nascimento: inputValue("inputDataNascimento") || null,
    cnh: inputValue("inputCNH") || null,
    email: inputValue("inputEmail") || null,
  };

  if (!data.nome || !data.cpf || !data.data_nascimento) {
    alert("Nome, CPF e Data de Nascimento são obrigatórios!");
    return;
  }

  let response;
  if (motoristaEditandoCpf) {
    response = await fetch(`${API}/motoristas/${motoristaEditandoCpf}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } else {
    response = await fetch(API + "/motoristas/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    alert("Erro ao salvar motorista: " + errText);
    return;
  }

  motoristaEditandoCpf = null;
  document.getElementById("motoristaForm").classList.add("hidden");
  loadMotoristas();
};

async function editMotorista(cpf) {
  const m = motoristasCache.find(m => m.cpf === cpf);

  document.getElementById("inputNomeMotorista").value = m.nome;
  document.getElementById("inputCPF").value = m.cpf || "";
  document.getElementById("inputTelefone").value = m.telefone || "";
  document.getElementById("inputDataNascimento").value = m.data_nascimento || "";
  document.getElementById("inputCNH").value = m.cnh || "";
  document.getElementById("inputEmail").value = m.email || "";

  motoristaEditandoCpf = cpf;
  document.getElementById("motoristaForm").classList.remove("hidden");
}

async function deleteMotorista(cpf) {
  await fetch(`${API}/motoristas/${cpf}`, { method: "DELETE" });
  loadMotoristas();
}

async function loadManutencoes() {
  await loadVeiculosCache();

  const data = await fetch(API + "/manutencoes").then(r => r.json());
  const list = document.getElementById("manutencoesList");
  list.innerHTML = "";

  data.forEach(m => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p>${m.veiculo_placa} - ${m.data} - ${m.status}</p>
      <button onclick="editManutencao(${m.id})">Editar</button>
      <button onclick="deleteManutencao(${m.id})">Excluir</button>
    `;
    list.appendChild(div);
  });
}

document.getElementById("addManutencaoBtn").onclick = () => {
  manutencaoEditandoId = null;
  document.getElementById("manutencaoForm").classList.remove("hidden");
};

document.getElementById("cancelManutencao").onclick = () => {
  document.getElementById("manutencaoForm").classList.add("hidden");
};

document.getElementById("saveManutencao").onclick = async () => {
  const veiculoId = inputVeiculoManut.dataset.id;

  if (!veiculoId) return alert("Selecione um veículo válido");

  const data = {
    veiculo_id: veiculoId,
    data: inputDataManut.value,
    status: inputStatusManut.value
  };

  const method = manutencaoEditandoId ? "PUT" : "POST";
  const url = manutencaoEditandoId ? `${API}/manutencoes/${manutencaoEditandoId}` : `${API}/manutencoes`;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  document.getElementById("manutencaoForm").classList.add("hidden");
  loadManutencoes();
};

async function editManutencao(id) {
  const data = await fetch(API + "/manutencoes").then(r => r.json());
  const m = data.find(m => m.id == id);

  const veiculo = veiculosCache.find(v => v.id == m.veiculo_id);

  inputVeiculoManut.value = veiculo ? `${veiculo.placa} - ${veiculo.modelo}` : "";
  inputVeiculoManut.dataset.id = m.veiculo_id;

  inputDataManut.value = m.data;
  inputStatusManut.value = m.status;

  manutencaoEditandoId = id;
  document.getElementById("manutencaoForm").classList.remove("hidden");
}

async function loadAbastecimentos() {
  await loadVeiculosCache();

  const data = await fetch(API + "/abastecimentos").then(r => r.json());
  const list = document.getElementById("abastecimentosList");
  list.innerHTML = "";

  data.forEach(a => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p>${a.veiculo_placa} - ${a.data} - ${a.tipo_combustivel}</p>
      <p>Posto: ${a.posto || "N/A"} | ${a.litros}L - R$${a.valor}</p>
      <button onclick="editAbastecimento(${a.id})">Editar</button>
      <button onclick="deleteAbastecimento(${a.id})">Excluir</button>
    `;
    list.appendChild(div);
  });
}

async function editAbastecimento(id) {
  const a = (await fetch(API + "/abastecimentos").then(r => r.json())).find(a => a.id == id);

  inputVeiculoAbast.value = a.veiculo_placa;
  inputVeiculoAbast.dataset.id = a.veiculo_id;
  inputDataAbast.value = a.data;
  selectOption(a.tipo_combustivel);
  inputPosto.value = a.posto || "";
  inputLitros.value = a.litros;
  inputValor.value = a.valor;

  abastecimentoEditandoId = id;
  document.getElementById("abastecimentoForm").classList.remove("hidden");
}

async function deleteAbastecimento(id) {
  await fetch(`${API}/abastecimentos/${id}`, { method: "DELETE" });
  loadAbastecimentos();
}

document.getElementById("addAbastecimentoBtn").onclick = () => {
  document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addAbastecimentoBtn").onclick = () => {
    abastecimentoEditandoId = null;
    resetAbastecimentoForm();
    document.getElementById("abastecimentoForm").classList.remove("hidden");
  };
});
  abastecimentoEditandoId = null;
  resetAbastecimentoForm();
  document.getElementById("abastecimentoForm").classList.remove("hidden");
};

document.getElementById("cancelAbastecimento").onclick = () => {
  resetAbastecimentoForm();
};

function resetAbastecimentoForm() {
  ["inputVeiculoAbast", "inputDataAbast", "inputPosto", "inputLitros", "inputValor"].forEach(id => {
    const el = document.getElementById(id);
    el.value = "";
    el.dataset.id = "";
  });

  document.getElementById("combustivel").value = "";
  document.getElementById("abastecimentoForm").classList.add("hidden");
}

document.getElementById("saveAbastecimento").onclick = async () => {
  const veiculoId = inputVeiculoAbast.dataset.id;

  if (!veiculoId) return alert("Selecione um veículo válido");

  const tipoCombustivel = document.getElementById("combustivel").value;
  const data = {
    veiculo_id: veiculoId,
    data: inputValue("inputDataAbast"),
    tipo_combustivel: tipoCombustivel,
    posto: inputValue("inputPosto"),
    litros: inputValue("inputLitros"),
    valor: inputValue("inputValor")
  };

  const method = abastecimentoEditandoId ? "PUT" : "POST";
  const url = abastecimentoEditandoId ? `${API}/abastecimentos/${abastecimentoEditandoId}` : `${API}/abastecimentos`;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  resetAbastecimentoForm();
  loadAbastecimentos();
};


function inputValue(id) {
  return document.getElementById(id).value;
}

function loadPageData(pageId) {
  if (pageId === "dashboardPage") loadDashboard();
  if (pageId === "veiculosPage") loadVeiculos();
  if (pageId === "motoristasPage") loadMotoristas();
  if (pageId === "manutencoesPage") loadManutencoes();
  if (pageId === "abastecimentosPage") loadAbastecimentos();
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadMotoristasCache();
  await loadVeiculosCache();
  initAutocompletes();
  loadDashboard();
});
function toggleDropdown() {
  document.getElementById("options").classList.toggle("active");
}

function selectOption(valor) {
  document.querySelector(".selected").innerText = valor + " ▼";
  document.getElementById("options").classList.remove("active");
}
console.log("Script carregou");

const btn = document.getElementById("addAbastecimentoBtn");
console.log("Botão:", btn);

btn.onclick = () => {
  console.log("CLICOU!");
  document.getElementById("abastecimentoForm").classList.remove("hidden");
};