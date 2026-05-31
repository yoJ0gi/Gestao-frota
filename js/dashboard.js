async function loadDashboard() {
  try {
    await Promise.all([
      loadVeiculosCache(),
      loadFuncionariosCache()
    ]);

    const totalOcorrenciasEl = document.getElementById("totalOcorrencias");
    const viaturasRotaEl = document.getElementById("viaturasRota");
    const equipeDisponivelEl = document.getElementById("equipeDisponivel");
    const totalViaturasEl = document.getElementById('totalViaturas');

    if (totalOcorrenciasEl) totalOcorrenciasEl.textContent = ocorrenciasCache.length;
    if (viaturasRotaEl) viaturasRotaEl.textContent = veiculosCache.length;
    
    const disponiveis = funcionariosCache.filter(f => f.status === "Disponível").length;
    if (equipeDisponivelEl) equipeDisponivelEl.textContent = disponiveis;
    
    if (totalViaturasEl) totalViaturasEl.textContent = veiculosCache.length;
  } catch(e) {}
}
