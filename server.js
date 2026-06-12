function finalizarEnvioPreVistoria() {
    const dadosSimulacao = {
        tomador: document.getElementById('tomador').value,
        telefone: document.getElementById('telefone').value,
        matricula: document.getElementById('matricula').value,
        relatorio: configPeritagem.map(item => {
            const dados = dataStore[item.id];
            return dados ? { campo: item.label, nitidez: dados.nitidez, status: dados.aiDamage } : null;
        }).filter(Boolean)
    };

    // Mostra um alerta visual de processamento ao utilizador
    alert("A processar e a enviar simulação para análise técnica...");

    // Comunicação direta com o teu servidor de produção de forma invisível
    fetch('https://api.mystas.co/v1/simulacao-webhook', { // Substitui pela URL do teu servidor (Laravel ou Node)
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(dadosSimulacao)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success' || data.success) {
            alert("Sucesso! A simulação deu entrada e já foi disparada para os teus e-mails.");
            location.reload();
        } else {
            alert("Erro ao processar no servidor, a tentar contingência...");
        }
    })
    .catch(error => {
        console.error("Erro no envio do Webhook:", error);
        // Se o teu servidor falhar por falta de rede, abre o mailto como plano de contingência (Fallback)
        window.location.href = `mailto:nquinguengue@stas.co.ao,nelsonquinguengue@gmail.com?subject=Erro Servidor - Simulação ${dadosSimulacao.matricula}&body=${JSON.stringify(dadosSimulacao)}`;
    });
}
