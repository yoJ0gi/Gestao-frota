let selectedOcorrenciaId = null;

function loadOcorrencias() {
  const list = document.getElementById("ocorrenciasList");
  if (!list) return;
  list.innerHTML = "";

  const badge = document.getElementById("badgeTotalOcorrencias");
  if (badge) badge.textContent = ocorrenciasCache.length;

  ocorrenciasCache.forEach(o => {
    const card = document.createElement("div");
    card.className = "tracking-card";
    card.dataset.id = o.id;
    if (o.id === selectedOcorrenciaId) card.classList.add("selected");

    let statusClass = "badge-available";
    let icon = "ph-check-circle";
    if (o.status === "Ativa") { statusClass = "badge-emergency"; icon = "ph-warning-circle"; }
    else if (o.status === "Em Atendimento") { statusClass = "badge-route"; icon = "ph-clock"; }

    card.innerHTML = `
      <div class="tc-header">
        <h3 style="font-size: 14px;">${o.titulo.substring(0, 20)}...</h3>
        <span class="status-badge ${statusClass}">
          <i class="ph ${icon}"></i> ${o.status}
        </span>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">
        <i class="ph ph-calendar"></i> ${o.data} | Prioridade: ${o.prioridade}
      </div>
    `;

    card.onclick = () => selectOcorrencia(o.id);
    list.appendChild(card);
  });

  closeDetails('ocorrencias');
}

function selectOcorrencia(id) {
  selectedOcorrenciaId = id;
  const o = ocorrenciasCache.find(oc => oc.id === id);
  if (!o) return;

  const cards = document.querySelectorAll("#ocorrenciasList .tracking-card");
  cards.forEach(card => {
    if (Number(card.dataset.id) === Number(id)) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });

  const el = docId => document.getElementById(docId);
  if(el("detailOcorrenciaTitulo")) el("detailOcorrenciaTitulo").textContent = o.titulo || 'Sem Título';
  
  if(el("detailOcorrenciaStatus")) {
    let statusClass = "badge-available";
    let icon = "ph-check-circle";
    if (o.status === "Ativa") { statusClass = "badge-emergency"; icon = "ph-warning-circle"; }
    else if (o.status === "Em Atendimento") { statusClass = "badge-route"; icon = "ph-clock"; }

    el("detailOcorrenciaStatus").className = `status-badge ${statusClass}`;
    el("detailOcorrenciaStatus").innerHTML = `<i class="ph ${icon}"></i> ${o.status}`;
  }
  
  if(el("detailOcorrenciaPrioridade")) el("detailOcorrenciaPrioridade").textContent = o.prioridade || '-';
  if(el("detailOcorrenciaData")) el("detailOcorrenciaData").textContent = o.data || '-';
  if(el("detailOcorrenciaPaciente")) el("detailOcorrenciaPaciente").textContent = o.paciente || '-';
  if(el("detailOcorrenciaEndereco")) el("detailOcorrenciaEndereco").textContent = o.endereco || '-';
  if(el("detailOcorrenciaVeiculo")) el("detailOcorrenciaVeiculo").textContent = o.veiculo_nome || 'Não vinculado';
  if(el("detailOcorrenciaEquipe")) el("detailOcorrenciaEquipe").textContent = o.equipe_nome || 'Não vinculado';
  if(el("detailOcorrenciaDescricao")) el("detailOcorrenciaDescricao").textContent = o.descricao || '-';

  const btnEdit = el("btnEditOcorrencia");
  if(btnEdit) btnEdit.onclick = () => editOcorrencia(o.id);

  const btnDel = el("btnDeleteOcorrencia");
  if(btnDel) btnDel.onclick = () => {
    if(confirm(`Tem certeza que deseja remover a ocorrência "${o.titulo}"?`)) {
      deleteOcorrencia(o.id);
    }
  };

  const btnRes = el("btnResolverOcorrencia");
  if(btnRes) btnRes.onclick = () => {
    o.status = "Finalizada";
    loadOcorrencias();
  };

  showDetails('ocorrencias');
}

document.getElementById("addOcorrenciaBtn").onclick = () => {
  ocorrenciaEditandoId = null;
  resetOcorrenciaForm();
  document.getElementById("saveOcorrencia").innerHTML = '<i class="ph ph-paper-plane-right"></i> Salvar Ocorrência';
  document.getElementById("ocorrenciaModal").classList.remove("hidden");
};

function resetOcorrenciaForm() {
  ["inputOcorrenciaTitulo", "inputOcorrenciaPaciente", "inputOcorrenciaPrioridade", "inputOcorrenciaEndereco", "inputOcorrenciaStatus", "inputOcorrenciaVeiculo", "inputOcorrenciaEquipe", "inputOcorrenciaDescricao"].forEach(id => {
    const el = document.getElementById(id);
    if(el) {
      el.value = (el.tagName === "SELECT") ? el.options[0].value : "";
      if(el.dataset) el.dataset.id = "";
    }
  });
  document.getElementById("ocorrenciaModal").classList.add("hidden");
}

document.getElementById("cancelOcorrencia").onclick = resetOcorrenciaForm;
const closeOcorrenciaModalBtn = document.getElementById("closeOcorrenciaModal");
if (closeOcorrenciaModalBtn) closeOcorrenciaModalBtn.onclick = resetOcorrenciaForm;

document.getElementById("saveOcorrencia").onclick = () => {
  const data = {
    titulo: inputValue("inputOcorrenciaTitulo"),
    paciente: inputValue("inputOcorrenciaPaciente"),
    prioridade: inputValue("inputOcorrenciaPrioridade"),
    endereco: inputValue("inputOcorrenciaEndereco"),
    status: inputValue("inputOcorrenciaStatus"),
    veiculo_nome: inputValue("inputOcorrenciaVeiculo"),
    equipe_nome: inputValue("inputOcorrenciaEquipe"),
    descricao: inputValue("inputOcorrenciaDescricao"),
    data: new Date().toISOString().split('T')[0]
  };

  if (ocorrenciaEditandoId) {
    const idx = ocorrenciasCache.findIndex(o => o.id == ocorrenciaEditandoId);
    if (idx > -1) {
      ocorrenciasCache[idx] = { ...ocorrenciasCache[idx], ...data, data: ocorrenciasCache[idx].data };
    }
  } else {
    const newId = ocorrenciasCache.length > 0 ? Math.max(...ocorrenciasCache.map(o => o.id)) + 1 : 1;
    ocorrenciasCache.push({ id: newId, ...data });
    selectedOcorrenciaId = newId;
  }

  resetOcorrenciaForm();
  loadOcorrencias();
};

function editOcorrencia(id) {
  const o = ocorrenciasCache.find(oc => oc.id == id);
  if(!o) return;

  document.getElementById("inputOcorrenciaTitulo").value = o.titulo || "";
  document.getElementById("inputOcorrenciaPaciente").value = o.paciente || "";
  document.getElementById("inputOcorrenciaPrioridade").value = o.prioridade || "Baixa";
  document.getElementById("inputOcorrenciaEndereco").value = o.endereco || "";
  document.getElementById("inputOcorrenciaStatus").value = o.status || "Ativa";
  document.getElementById("inputOcorrenciaVeiculo").value = o.veiculo_nome || "";
  document.getElementById("inputOcorrenciaEquipe").value = o.equipe_nome || "";
  document.getElementById("inputOcorrenciaDescricao").value = o.descricao || "";

  ocorrenciaEditandoId = id;
  document.getElementById("saveOcorrencia").innerHTML = '<i class="ph ph-pencil-simple"></i> Atualizar Ocorrência';
  document.getElementById("ocorrenciaModal").classList.remove("hidden");
}

function deleteOcorrencia(id) {
  ocorrenciasCache = ocorrenciasCache.filter(o => o.id != id);
  if (selectedOcorrenciaId == id) selectedOcorrenciaId = null;
  loadOcorrencias();
}
