// js/login-patient.js
document.addEventListener('DOMContentLoaded', () => {
    if (isPatientLoggedIn()) {
        window.location.href = 'patient-dashboard.html';
        return;
    }

    const formLoginPatient = document.getElementById('form-login-patient');
    const errorLoginDiv = document.getElementById('error-login-patient');

    formLoginPatient.addEventListener('submit', (e) => {
        e.preventDefault();
        errorLoginDiv.textContent = '';

        const email = document.getElementById('patient-login-email').value.trim();
        const password = document.getElementById('patient-login-password').value;

        if (!email || !password) {
            errorLoginDiv.textContent = 'Email e senha são obrigatórios.';
            return;
        }

        if (loginPatient(email, password)) { // Função de auth.js
            window.location.href = 'patient-dashboard.html';
        } else {
            errorLoginDiv.textContent = 'Email ou senha inválidos.';
        }
    });
});