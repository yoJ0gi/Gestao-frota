let usingMockFuncionarios = false;
let selectedFuncionarioId = null;

async function loadFuncionariosCache() {
  if (usingMockFuncionarios) return;
  try {
    const res = await fetch(API + "/motoristas");
    if (!res.ok) throw new Error("API failed");
    const motoristas = await res.json();
    
    const nonMotoristas = funcionariosCache.filter(f => f.cargo !== "Motorista");
    const fetchedMotoristas = motoristas.map(m => ({
      id: m.id,
      nome: m.nome,
      cargo: "Motorista",
      cpf: m.cpf || "",
      apto_dirigir: "Sim",
      cnh: m.cnh || "",
      validade_cnh: m.validade_cnh || "",
      registro: "",
      idade: m.idade || "",
      telefone: m.telefone || "",
      email: m.email || "",
      status: m.status || "Disponível"
    }));
    
    funcionariosCache = [...fetchedMotoristas, ...nonMotoristas];
  } catch (err) {
    console.warn("Backend offline ou erro, usando mock data unificado");
    usingMockFuncionarios = true;
  }
}

async function loadFuncionarios(filter = null) {
  await loadFuncionariosCache();

  const titleEl = document.getElementById("funcionariosPageTitle");
  const subtitleEl = document.getElementById("funcionariosPageSubtitle");
  if (titleEl) {
    titleEl.textContent = filter ? filter + "s" : "Funcionários";
  }
  if (subtitleEl) {
    subtitleEl.textContent = filter 
      ? `Listando todos os ${filter.toLowerCase()}s vinculados à frota hospitalar` 
      : "Todos os profissionais vinculados à frota hospitalar";
  }

  const list = document.getElementById("funcionariosList");
  if (list) list.innerHTML = "";

  const filtered = filter 
    ? funcionariosCache.filter(f => f.cargo === filter)
    : funcionariosCache;

  filtered.forEach(f => {
    const card = document.createElement("div");
    card.className = "tracking-card";
    card.dataset.id = f.id;
    if (f.id === selectedFuncionarioId) card.classList.add("selected");

    let statusBadge = `<span class="status-badge badge-available"><i class="ph ph-check-circle"></i> Disponível</span>`;
    if (f.status === "Em Rota") {
      statusBadge = `<span class="status-badge badge-route"><i class="ph ph-navigation-arrow"></i> Em Rota</span>`;
    }

    card.innerHTML = `
      <div class="tc-header">
        <h3>${f.nome}</h3>
        ${statusBadge}
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">
        ${f.cargo} ${f.registro ? '| ' + f.registro : ''}
      </div>
      <div class="tc-image" style="display: flex; justify-content: center; align-items: center; padding: 1rem 0;">
        <i class="ph ph-user-circle" style="font-size: 64px; color: var(--text-muted);"></i>
      </div>
    `;

    card.onclick = () => selectFuncionario(f.id);
    if (list) list.appendChild(card);
  });

  closeDetails('funcionarios');
}

function selectFuncionario(id) {
  selectedFuncionarioId = id;
  const f = funcionariosCache.find(func => func.id == id);
  if (!f) return;

  const cards = document.querySelectorAll("#funcionariosList .tracking-card");
  cards.forEach(card => {
    if (card.dataset.id == id) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });

  const el = docId => document.getElementById(docId);
  
  if (el("detailFuncNome")) el("detailFuncNome").textContent = f.nome || 'Sem Nome';
  if (el("detailFuncStatus")) {
    const statusEl = el("detailFuncStatus");
    if (f.status === "Em Rota") {
      statusEl.className = "status-badge badge-route";
      statusEl.innerHTML = `<i class="ph ph-navigation-arrow"></i> Em Rota`;
    } else {
      statusEl.className = "status-badge badge-available";
      statusEl.innerHTML = `<i class="ph ph-check-circle"></i> Disponível`;
    }
  }

  if (el("detailFuncCargo")) el("detailFuncCargo").textContent = f.cargo || '-';
  if (el("detailFuncIdade")) el("detailFuncIdade").textContent = f.idade ? `${f.idade} anos` : '-';
  if (el("detailFuncCpf")) el("detailFuncCpf").textContent = f.cpf || '-';
  if (el("detailFuncTelefone")) el("detailFuncTelefone").textContent = f.telefone || '-';
  if (el("detailFuncEmail")) el("detailFuncEmail").textContent = f.email || '-';
  if (el("detailFuncApto")) el("detailFuncApto").textContent = f.apto_dirigir || "Não";

  const cnhBox = el("detailFuncCnhBox");
  const validadeCnhBox = el("detailFuncValidadeCnhBox");
  const registroBox = el("detailFuncRegistroBox");

  if (f.apto_dirigir === "Sim") {
    if (cnhBox) cnhBox.style.display = "block";
    if (validadeCnhBox) validadeCnhBox.style.display = "block";

    if (el("detailFuncCnh")) el("detailFuncCnh").textContent = f.cnh || '-';
    if (el("detailFuncValidadeCnh")) {
      if (f.validade_cnh) {
        const parts = f.validade_cnh.split("-");
        el("detailFuncValidadeCnh").textContent = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : f.validade_cnh;
      } else {
        el("detailFuncValidadeCnh").textContent = '-';
      }
    }
  } else {
    if (cnhBox) cnhBox.style.display = "none";
    if (validadeCnhBox) validadeCnhBox.style.display = "none";
  }

  if (f.cargo === "Motorista") {
    if (registroBox) registroBox.style.display = "none";
  } else {
    if (registroBox) registroBox.style.display = "block";
    if (el("detailFuncRegistro")) el("detailFuncRegistro").textContent = f.registro || '-';
  }

  const btnEdit = el("btnEditFuncionario");
  if (btnEdit) btnEdit.onclick = () => editFuncionario(f.id);

  const btnDel = el("btnDeleteFuncionario");
  if (btnDel) btnDel.onclick = () => {
    if (confirm(`Tem certeza que deseja remover o funcionário ${f.nome}?`)) {
      deleteFuncionario(f.id);
    }
  };

  showDetails('funcionarios');
}

const addFuncBtn = document.getElementById("addFuncionarioBtn");
if (addFuncBtn) {
  addFuncBtn.onclick = () => {
    funcionarioEditandoId = null;
    resetFuncionarioForm();
    document.getElementById("saveFuncionario").innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar Funcionário';
    document.getElementById("funcionarioModal").classList.remove("hidden");
  };
}

function resetFuncionarioForm() {
  ["inputFuncNome", "inputFuncCargo", "inputFuncCpf", "inputFuncIdade", "inputFuncTelefone", "inputFuncEmail", "inputFuncCnh", "inputFuncValidadeCnh", "inputFuncRegistro"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  
  const aptoSelect = document.getElementById("inputFuncApto");
  if (aptoSelect) {
    aptoSelect.value = "Não";
    aptoSelect.disabled = false;
  }

  updateModalConditionalFields("", "Não");
  document.getElementById("funcionarioModal").classList.add("hidden");
}

const cancelFuncBtn = document.getElementById("cancelFuncionario");
if (cancelFuncBtn) cancelFuncBtn.onclick = resetFuncionarioForm;

const closeFuncModalBtn = document.getElementById("closeFuncionarioModal");
if (closeFuncModalBtn) closeFuncModalBtn.onclick = resetFuncionarioForm;

function updateModalConditionalFields(cargo, aptoDirigir) {
  const fieldCnh = document.getElementById("fieldCnh");
  const fieldValidadeCnh = document.getElementById("fieldValidadeCnh");
  const fieldRegistro = document.getElementById("fieldRegistro");
  const aptoSelect = document.getElementById("inputFuncApto");

  let currentApto = aptoDirigir;

  if (cargo === "Motorista") {
    if (aptoSelect) {
      aptoSelect.value = "Sim";
      aptoSelect.disabled = true;
    }
    currentApto = "Sim";
  } else {
    if (aptoSelect) {
      aptoSelect.disabled = false;
    }
  }

  if (currentApto === "Sim") {
    if (fieldCnh) fieldCnh.classList.remove("hidden");
    if (fieldValidadeCnh) fieldValidadeCnh.classList.remove("hidden");
  } else {
    if (fieldCnh) fieldCnh.classList.add("hidden");
    if (fieldValidadeCnh) fieldValidadeCnh.classList.add("hidden");
  }

  if (cargo === "Médico" || cargo === "Enfermeiro" || cargo === "Socorrista") {
    if (fieldRegistro) fieldRegistro.classList.remove("hidden");
  } else {
    if (fieldRegistro) fieldRegistro.classList.add("hidden");
  }
}

const cargoSelect = document.getElementById("inputFuncCargo");
const aptoSelect = document.getElementById("inputFuncApto");

if (cargoSelect) {
  cargoSelect.addEventListener("change", (e) => {
    const aptoVal = aptoSelect ? aptoSelect.value : "Não";
    updateModalConditionalFields(e.target.value, aptoVal);
  });
}

if (aptoSelect) {
  aptoSelect.addEventListener("change", (e) => {
    const cargoVal = cargoSelect ? cargoSelect.value : "";
    updateModalConditionalFields(cargoVal, e.target.value);
  });
}

const saveFuncBtn = document.getElementById("saveFuncionario");
if (saveFuncBtn) {
  saveFuncBtn.onclick = async () => {
    const cargo = inputValue("inputFuncCargo");
    const apto = cargo === "Motorista" ? "Sim" : inputValue("inputFuncApto");
    const data = {
      nome: inputValue("inputFuncNome"),
      cargo: cargo,
      cpf: inputValue("inputFuncCpf"),
      idade: inputValue("inputFuncIdade"),
      telefone: inputValue("inputFuncTelefone"),
      email: inputValue("inputFuncEmail"),
      apto_dirigir: apto,
      cnh: apto === "Sim" ? inputValue("inputFuncCnh") : "",
      validade_cnh: apto === "Sim" ? inputValue("inputFuncValidadeCnh") : "",
      registro: cargo !== "Motorista" ? inputValue("inputFuncRegistro") : "",
      status: "Disponível"
    };

    if (cargo === "Motorista") {
      const method = funcionarioEditandoId && typeof funcionarioEditandoId === 'number' ? "PUT" : "POST";
      const url = funcionarioEditandoId && typeof funcionarioEditandoId === 'number' ? `${API}/motoristas/${funcionarioEditandoId}` : `${API}/motoristas`;
      
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: data.nome,
            cpf: data.cpf,
            telefone: data.telefone,
            idade: data.idade,
            cnh: data.cnh,
            validade_cnh: data.validade_cnh,
            email: data.email
          })
        });
        if (!res.ok) throw new Error("API Error");
        usingMockFuncionarios = false;
      } catch (err) {
        saveFuncionarioMock(data);
      }
    } else {
      saveFuncionarioMock(data);
    }

    resetFuncionarioForm();
    await loadFuncionarios(currentFuncionarioFilter);
  };
}

function saveFuncionarioMock(data) {
  if (funcionarioEditandoId) {
    const idx = funcionariosCache.findIndex(f => f.id == funcionarioEditandoId);
    if (idx > -1) {
      funcionariosCache[idx] = { ...funcionariosCache[idx], ...data };
    }
  } else {
    const numericIds = funcionariosCache.map(f => Number(f.id)).filter(n => !isNaN(n));
    const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    funcionariosCache.push({ id: newId, ...data });
    selectedFuncionarioId = newId;
  }
}

function editFuncionario(id) {
  const f = funcionariosCache.find(func => func.id == id);
  if (!f) return;

  document.getElementById("inputFuncNome").value = f.nome || "";
  document.getElementById("inputFuncCargo").value = f.cargo || "";
  document.getElementById("inputFuncCpf").value = f.cpf || "";
  document.getElementById("inputFuncIdade").value = f.idade || "";
  document.getElementById("inputFuncTelefone").value = f.telefone || "";
  document.getElementById("inputFuncEmail").value = f.email || "";

  const aptoSelect = document.getElementById("inputFuncApto");
  const aptoVal = f.apto_dirigir || "Não";
  if (aptoSelect) aptoSelect.value = aptoVal;

  updateModalConditionalFields(f.cargo, aptoVal);

  if (aptoVal === "Sim") {
    document.getElementById("inputFuncCnh").value = f.cnh || "";
    document.getElementById("inputFuncValidadeCnh").value = f.validade_cnh || "";
  } else {
    document.getElementById("inputFuncCnh").value = "";
    document.getElementById("inputFuncValidadeCnh").value = "";
  }

  if (f.cargo !== "Motorista") {
    document.getElementById("inputFuncRegistro").value = f.registro || "";
  } else {
    document.getElementById("inputFuncRegistro").value = "";
  }

  funcionarioEditandoId = id;
  document.getElementById("saveFuncionario").innerHTML = '<i class="ph ph-pencil-simple"></i> Atualizar Funcionário';
  document.getElementById("funcionarioModal").classList.remove("hidden");
}

async function deleteFuncionario(id) {
  const f = funcionariosCache.find(func => func.id == id);
  if (!f) return;

  if (f.cargo === "Motorista" && typeof id === 'number') {
    try {
      const res = await fetch(`${API}/motoristas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("API Error");
      usingMockFuncionarios = false;
    } catch (e) {
      funcionariosCache = funcionariosCache.filter(func => func.id != id);
      if (selectedFuncionarioId == id) selectedFuncionarioId = null;
    }
  } else {
    funcionariosCache = funcionariosCache.filter(func => func.id != id);
    if (selectedFuncionarioId == id) selectedFuncionarioId = null;
  }
  
  await loadFuncionarios(currentFuncionarioFilter);
}
