// js/auth.js

const SECRETARY_SESSION_KEY = 'secretaryLoggedInEmail'; // Store email for potential display
const PATIENT_SESSION_KEY = 'patientLoggedInId';

// --- Funções da Secretária ---
function loginSecretary(email, senha) {
    const secretaries = getFromDB('secretaries');
    const found = secretaries.find(sec => sec.email === email && sec.senha === senha);
    if (found) {
        localStorage.setItem(SECRETARY_SESSION_KEY, found.email);
        return true;
    }
    return false;
}

function isSecretaryLoggedIn() {
    return !!localStorage.getItem(SECRETARY_SESSION_KEY);
}

function logoutSecretary() {
    localStorage.removeItem(SECRETARY_SESSION_KEY);
    window.location.href = 'login-secretary.html';
}

// --- Funções do Paciente ---
function loginPatient(email, senha) {
    const pacientesList = getFromDB('pacientes');
    const foundPatient = pacientesList.find(p => p.email === email && p.senha === senha);
    if (foundPatient) {
        localStorage.setItem(PATIENT_SESSION_KEY, foundPatient.id);
        return true;
    }
    return false;
}

function getLoggedInPatientId() {
    return localStorage.getItem(PATIENT_SESSION_KEY);
}

function isPatientLoggedIn() {
    return !!getLoggedInPatientId();
}

function logoutPatient() {
    localStorage.removeItem(PATIENT_SESSION_KEY);
    window.location.href = 'login-patient.html';
}

// --- Proteção de Rotas ---
function protectSecretaryRoute() {
    if (!isSecretaryLoggedIn()) {
        alert("Acesso não autorizado. Por favor, faça login como secretária.");
        window.location.href = 'login-secretary.html';
    }
}

function protectPatientRoute() {
    if (!isPatientLoggedIn()) {
        alert("Acesso não autorizado. Por favor, faça login como paciente.");
        window.location.href = 'login-patient.html';
    }
}