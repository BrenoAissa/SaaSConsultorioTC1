// js/secretary-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    protectSecretaryRoute(); // Protege a rota no início

    const btnLogoutSecretary = document.getElementById('btn-logout-secretary');
    if (btnLogoutSecretary) {
        btnLogoutSecretary.addEventListener('click', () => {
            logoutSecretary();
        });
    }

    // Formulários
    const formPaciente = document.getElementById('form-paciente');
    const formMedico = document.getElementById('form-medico');
    const formConsulta = document.getElementById('form-consulta');

    // Selects para agendamento
    const selectPacienteConsulta = document.getElementById('consulta-paciente');
    const selectMedicoConsulta = document.getElementById('consulta-medico');

    // Lista de consultas
    const listaConsultasUl = document.getElementById('consultas-agendadas-lista');

    // Spans de erro (agrupados para facilitar o acesso)
    const errorSpans = {
        pacienteNome: document.getElementById('error-paciente-nome'),
        pacienteDataNascimento: document.getElementById('error-paciente-data-nascimento'),
        pacienteTelefone: document.getElementById('error-paciente-telefone'),
        pacienteEmail: document.getElementById('error-paciente-email'),
        pacienteSenha: document.getElementById('error-paciente-senha'),
        medicoNome: document.getElementById('error-medico-nome'),
        medicoEspecialidade: document.getElementById('error-medico-especialidade'),
        medicoCRM: document.getElementById('error-medico-crm'),
        consultaPaciente: document.getElementById('error-consulta-paciente'),
        consultaMedico: document.getElementById('error-consulta-medico'),
        consultaDataHora: document.getElementById('error-consulta-data-hora'),
    };

    function limparTodosOsErros() {
        for (const key in errorSpans) {
            if (errorSpans[key]) {
                errorSpans[key].textContent = '';
            }
        }
    }

    // --- FUNÇÕES DE VALIDAÇÃO ---
    function validarNome(nome, campoNomeExibicao = "Nome") {
        const nomeTrimmed = nome.trim();
        if (!nomeTrimmed) return `${campoNomeExibicao} é obrigatório.`;
        if (nomeTrimmed.length < 3 || nomeTrimmed.length > 100) {
            return `${campoNomeExibicao} deve ter entre 3 e 100 caracteres.`;
        }
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s\.]+$/.test(nomeTrimmed)) {
            return `${campoNomeExibicao} deve conter apenas letras, espaços e pontos (Ex: Dr. Nome).`;
        }
        return "";
    }

    function validarDataNascimento(dataNascimento) {
        if (!dataNascimento) return "Data de Nascimento é obrigatória.";
        const dataNasc = new Date(dataNascimento);
        const hoje = new Date();
        const dataNascPura = new Date(Date.UTC(dataNasc.getFullYear(), dataNasc.getMonth(), dataNasc.getDate()));
        const hojePura = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));


        if (isNaN(dataNascPura.getTime())) return "Data de Nascimento inválida.";
        if (dataNascPura >= hojePura) {
            return "Data de Nascimento deve ser anterior à data de hoje.";
        }
        return "";
    }

    function validarTelefone(telefone) {
        const telefoneTrimmed = telefone.trim();
        if (!telefoneTrimmed) return "Telefone é obrigatório.";
        const digitos = telefoneTrimmed.replace(/\D/g, ''); 
        if (digitos.length < 10 || digitos.length > 11) { 
            return "Telefone inválido. Deve conter 10 ou 11 dígitos (DDD + Número).";
        }
        return "";
    }

    function validarEmail(email, verificarDuplicidade = true, pacienteIdAtual = null) {
        const emailTrimmed = email.trim();
        if (!emailTrimmed) return "Email é obrigatório.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
            return "Formato de email inválido.";
        }
        if (verificarDuplicidade) {
            const pacienteExistente = pacientes.find(p => p.email.toLowerCase() === emailTrimmed.toLowerCase() && p.id !== pacienteIdAtual);
            if (pacienteExistente) {
                return "Este email já está cadastrado para outro paciente.";
            }
        }
        return "";
    }

    function validarSenha(senha) {
        if (!senha) return "Senha é obrigatória.";
        if (senha.length < 6) {
            return "Senha deve ter pelo menos 6 caracteres.";
        }

        if (!/(?=.*[A-Z])/.test(senha)) return "Senha deve conter pelo menos uma letra maiúscula.";
        if (!/(?=.*[0-9])/.test(senha)) return "Senha deve conter pelo menos um número.";
        return "";
    }

    function validarEspecialidade(especialidade) {
        const especialidadeTrimmed = especialidade.trim();
        if (!especialidadeTrimmed) return "Especialidade é obrigatória.";
        if (especialidadeTrimmed.length < 3 || especialidadeTrimmed.length > 100) {
            return "Especialidade deve ter entre 3 e 100 caracteres.";
        }
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s\-]+$/.test(especialidadeTrimmed)) {
            return "Especialidade deve conter apenas letras, números, espaços ou hífens.";
        }
        return "";
    }

    function validarCRM(crm) {
        const crmTrimmed = crm.trim().toUpperCase(); 
        if (!crmTrimmed) return "CRM é obrigatório.";
        if (!/^[0-9]{1,8}-?[A-Z]{2}$/.test(crmTrimmed)) {
            return "CRM inválido. Formato esperado: XXXXXSP ou XXXXX-SP (números seguidos pela sigla do estado).";
        }
        return "";
    }

    function validarDataHoraConsulta(dataHora) {
        if (!dataHora) return "Data e Hora da consulta são obrigatórias.";
        const dataConsulta = new Date(dataHora);
        const agora = new Date();

        if (isNaN(dataConsulta.getTime())) return "Data e Hora da consulta inválidas.";
        if (dataConsulta <= agora) { 
            return "A Data e Hora da consulta devem ser no futuro.";
        }
        const diaSemana = dataConsulta.getDay();
        const hora = dataConsulta.getHours();
        if (diaSemana === 0 || diaSemana === 6) return "Consultas não podem ser agendadas nos fins de semana.";
        if (hora < 8 || hora >= 18) return "Consultas apenas entre 08:00 e 18:00.";
        return "";
    }

    // --- CADASTRO DE PACIENTE ---
    formPaciente.addEventListener('submit', (e) => {
        e.preventDefault();
        limparTodosOsErros();
        let isValid = true;

        const nomeInput = document.getElementById('paciente-nome');
        const dataNascimentoInput = document.getElementById('paciente-data-nascimento');
        const telefoneInput = document.getElementById('paciente-telefone');
        const emailInput = document.getElementById('paciente-email');
        const senhaInput = document.getElementById('paciente-senha');

        const nome = nomeInput.value;
        const dataNascimento = dataNascimentoInput.value;
        const telefone = telefoneInput.value;
        const email = emailInput.value;
        const senha = senhaInput.value;

        const erroNome = validarNome(nome, "Nome do Paciente");
        if (erroNome) { errorSpans.pacienteNome.textContent = erroNome; isValid = false; }

        const erroDataNasc = validarDataNascimento(dataNascimento);
        if (erroDataNasc) { errorSpans.pacienteDataNascimento.textContent = erroDataNasc; isValid = false; }

        const erroTelefone = validarTelefone(telefone);
        if (erroTelefone) { errorSpans.pacienteTelefone.textContent = erroTelefone; isValid = false; }

        const erroEmail = validarEmail(email, true); // true para verificar duplicidade no cadastro
        if (erroEmail) { errorSpans.pacienteEmail.textContent = erroEmail; isValid = false; }

        const erroSenha = validarSenha(senha);
        if (erroSenha) { errorSpans.pacienteSenha.textContent = erroSenha; isValid = false; }

        if (!isValid) return;

        const novoPaciente = {
            id: gerarId(),
            nome: nome.trim(),
            dataNascimento,
            telefone: telefone.trim().replace(/\D/g, ''), 
            email: email.trim().toLowerCase(), 
            senha 
        };
        pacientes.push(novoPaciente); 
        saveToDB('pacientes', pacientes);
        alert('Paciente cadastrado com sucesso!');
        formPaciente.reset();
        limparTodosOsErros(); 
        carregarPacientesSelect(); 
    });

    // --- CADASTRO DE MÉDICO ---
    formMedico.addEventListener('submit', (e) => {
        e.preventDefault();
        limparTodosOsErros();
        let isValid = true;

        const nomeInput = document.getElementById('medico-nome');
        const especialidadeInput = document.getElementById('medico-especialidade');
        const crmInput = document.getElementById('medico-crm');

        const nome = nomeInput.value;
        const especialidade = especialidadeInput.value;
        const crm = crmInput.value;

        const erroNome = validarNome(nome, "Nome do Médico");
        if (erroNome) { errorSpans.medicoNome.textContent = erroNome; isValid = false; }

        const erroEspecialidade = validarEspecialidade(especialidade);
        if (erroEspecialidade) { errorSpans.medicoEspecialidade.textContent = erroEspecialidade; isValid = false; }

        const erroCRM = validarCRM(crm);
        if (erroCRM) { errorSpans.medicoCRM.textContent = erroCRM; isValid = false; }

        if (!isValid) return;

        const novoMedico = {
            id: gerarId(),
            nome: nome.trim(),
            especialidade: especialidade.trim(),
            crm: crm.trim().toUpperCase().replace("-", "") // Salva CRM normalizado
        };
        medicos.push(novoMedico); // 'medicos' de db.js
        saveToDB('medicos', medicos); // Função de db.js
        alert('Médico cadastrado com sucesso!');
        formMedico.reset();
        limparTodosOsErros();
        carregarMedicosSelect(); // Atualiza o select de agendamento
    });

    // --- AGENDAMENTO DE CONSULTA ---
    formConsulta.addEventListener('submit', (e) => {
        e.preventDefault();
        limparTodosOsErros();
        let isValid = true;

        const pacienteId = selectPacienteConsulta.value;
        const medicoId = selectMedicoConsulta.value;
        const dataHoraInput = document.getElementById('consulta-data-hora').value;

        if (!pacienteId) { errorSpans.consultaPaciente.textContent = "Selecione um paciente."; isValid = false; }
        if (!medicoId) { errorSpans.consultaMedico.textContent = "Selecione um médico."; isValid = false; }

        const erroDataHora = validarDataHoraConsulta(dataHoraInput);
        if (erroDataHora) { errorSpans.consultaDataHora.textContent = erroDataHora; isValid = false; }

        if (!isValid) return;

        const dataHoraAgendamento = new Date(dataHoraInput).toISOString(); 

        const pacienteOcupado = consultas.some(consulta =>
            consulta.pacienteId === pacienteId &&
            new Date(consulta.dataHora).toISOString() === dataHoraAgendamento &&
            consulta.status === 'agendada'
        );
        if (pacienteOcupado) {
            alert('Erro: Paciente já possui uma consulta agendada para este horário.');
            return;
        }

        const medicoOcupado = consultas.some(consulta =>
            consulta.medicoId === medicoId &&
            new Date(consulta.dataHora).toISOString() === dataHoraAgendamento &&
            consulta.status === 'agendada'
        );
        if (medicoOcupado) {
            alert('Erro: Médico já possui uma consulta agendada para este horário.');
            return;
        }

        const novaConsulta = {
            id: gerarId(),
            pacienteId,
            medicoId,
            dataHora: dataHoraAgendamento,
            status: 'agendada'
        };
        consultas.push(novaConsulta); 
        saveToDB('consultas', consultas); 
        alert('Consulta agendada com sucesso!');
        formConsulta.reset();
        limparTodosOsErros();
        selectPacienteConsulta.value = ""; 
        selectMedicoConsulta.value = "";
        carregarConsultas(); 
    });

    function carregarPacientesSelect() {
        const valorAnterior = selectPacienteConsulta.value; 
        selectPacienteConsulta.innerHTML = '<option value="">Selecione um Paciente</option>';
        pacientes.forEach(paciente => {
            const option = document.createElement('option');
            option.value = paciente.id;
            option.textContent = paciente.nome;
            selectPacienteConsulta.appendChild(option);
        });
        if (pacientes.find(p => p.id === valorAnterior)) {
             selectPacienteConsulta.value = valorAnterior;
        }
    }

    function carregarMedicosSelect() {
        const valorAnterior = selectMedicoConsulta.value;
        selectMedicoConsulta.innerHTML = '<option value="">Selecione um Médico</option>';
        medicos.forEach(medico => {
            const option = document.createElement('option');
            option.value = medico.id;
            option.textContent = `${medico.nome} (${medico.especialidade})`;
            selectMedicoConsulta.appendChild(option);
        });
         if (medicos.find(m => m.id === valorAnterior)) {
            selectMedicoConsulta.value = valorAnterior;
        }
    }

    function carregarConsultas() {
        listaConsultasUl.innerHTML = ''; 
        const consultasAgendadas = consultas
            .filter(c => c.status === 'agendada')
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora)); 

        if (consultasAgendadas.length === 0) {
            listaConsultasUl.innerHTML = '<li>Nenhuma consulta agendada no momento.</li>';
            return;
        }

        consultasAgendadas.forEach(consulta => {
            const paciente = pacientes.find(p => p.id === consulta.pacienteId);
            const medico = medicos.find(m => m.id === consulta.medicoId);

            if (paciente && medico) { 
                const listItem = document.createElement('li');
                const dataHoraObj = new Date(consulta.dataHora); 
                const dataFormatada = dataHoraObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const horaFormatada = dataHoraObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                const infoSpan = document.createElement('span');
                infoSpan.classList.add('info');
                infoSpan.innerHTML = `
                    <strong>Paciente:</strong> ${paciente.nome} <br>
                    <strong>Médico:</strong> ${medico.nome} (${medico.especialidade}) <br>
                    <strong>Data:</strong> ${dataFormatada} às ${horaFormatada}
                `;

                const btnCancelar = document.createElement('button');
                btnCancelar.textContent = 'Cancelar';
                btnCancelar.classList.add('btn', 'btn-danger', 'btn-sm');
                btnCancelar.style.marginLeft = '10px';
                btnCancelar.onclick = () => confirmarCancelamento(consulta.id);

                listItem.appendChild(infoSpan);
                listItem.appendChild(btnCancelar);
                listaConsultasUl.appendChild(listItem);
            }
        });
    }

    function confirmarCancelamento(consultaId) {
        if (confirm('Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.')) {
            cancelarConsulta(consultaId);
        }
    }

    function cancelarConsulta(consultaId) {
        const consultaIndex = consultas.findIndex(c => c.id === consultaId);
        if (consultaIndex > -1) {
            consultas[consultaIndex].status = 'cancelada';
            saveToDB('consultas', consultas);
            carregarConsultas();
            alert('Consulta cancelada com sucesso.');
        } else {
            alert('Erro: Consulta não encontrada para cancelamento.');
        }
    }

    limparTodosOsErros();
    carregarPacientesSelect();
    carregarMedicosSelect();
    carregarConsultas();
});