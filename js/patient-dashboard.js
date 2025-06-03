// js/patient-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    protectPatientRoute();

    const patientId = getLoggedInPatientId();
    const patientNamePlaceholder = document.getElementById('patient-name-placeholder');
    const minhasConsultasListUl = document.getElementById('minhas-consultas-lista');
    const historicoConsultasListUl = document.getElementById('historico-consultas-paciente-lista');
    const btnLogoutPatient = document.getElementById('btn-logout-patient');

    if (btnLogoutPatient) {
        btnLogoutPatient.addEventListener('click', () => {
            logoutPatient();
        });
    }

    if (!patientId) {
        console.error("ID do paciente não encontrado na sessão.");
        // A função protectPatientRoute já deve ter redirecionado
        return;
    }

    const todosPacientes = getFromDB('pacientes'); // Vem de db.js
    const pacienteLogado = todosPacientes.find(p => p.id === patientId);

    if (pacienteLogado && patientNamePlaceholder) {
        patientNamePlaceholder.textContent = pacienteLogado.nome.split(" ")[0]; // Mostra o primeiro nome
    } else if (patientNamePlaceholder) {
        patientNamePlaceholder.textContent = "Desconhecido";
    }

    carregarDadosPaciente();

    function carregarDadosPaciente() {
        const todasConsultas = getFromDB('consultas'); // Vem de db.js
        const todosMedicos = getFromDB('medicos'); // Vem de db.js

        const consultasAgendadasDoPaciente = todasConsultas
            .filter(c => c.pacienteId === patientId && c.status === 'agendada')
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

        const consultasHistoricoDoPaciente = todasConsultas
            .filter(c => c.pacienteId === patientId && (c.status === 'realizada' || c.status === 'cancelada'))
            .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora)); // Mais recentes primeiro

        renderizarListaConsultas(minhasConsultasListUl, consultasAgendadasDoPaciente, todosMedicos, "Você não tem consultas agendadas.");
        renderizarListaConsultas(historicoConsultasListUl, consultasHistoricoDoPaciente, todosMedicos, "Nenhum histórico de consultas encontrado.");
    }

    function renderizarListaConsultas(ulElement, listaConsultas, medicosDb, mensagemVazia) {
        ulElement.innerHTML = '';
        if (listaConsultas.length === 0) {
            ulElement.innerHTML = `<li>${mensagemVazia}</li>`;
            return;
        }

        listaConsultas.forEach(consulta => {
            const medico = medicosDb.find(m => m.id === consulta.medicoId);
            const listItem = document.createElement('li');
            const dataHoraObj = new Date(consulta.dataHora);
            const dataFormatada = dataHoraObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const horaFormatada = dataHoraObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            let statusClass = '';
            if (consulta.status === 'realizada') statusClass = 'status-realizada';
            else if (consulta.status === 'cancelada') statusClass = 'status-cancelada';
            else if (consulta.status === 'agendada') statusClass = 'status-agendada';


            listItem.innerHTML = `
                <div>
                    <strong>Médico:</strong> ${medico ? medico.nome : 'Médico não encontrado'} (${medico ? medico.especialidade : 'N/A'}) <br>
                    <strong>Data:</strong> ${dataFormatada} às ${horaFormatada} <br>
                    <strong>Status:</strong> <span class="${statusClass}">${consulta.status.charAt(0).toUpperCase() + consulta.status.slice(1)}</span>
                </div>
            `;  
                
            if (consulta.status === 'agendada') {
                const btnCancelar = document.createElement('button');
                btnCancelar.textContent = 'Cancelar';
                btnCancelar.classList.add('btn', 'btn-sm', 'btn-warning', 'mt-10');
                btnCancelar.onclick = () => { /* Lógica para paciente cancelar */ };
                listItem.appendChild(btnCancelar);
            }
            ulElement.appendChild(listItem);
        });
    }
});