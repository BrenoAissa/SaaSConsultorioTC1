// js/login-secretary.js
document.addEventListener('DOMContentLoaded', () => {
    if (isSecretaryLoggedIn()) {
        window.location.href = 'secretary-dashboard.html';
        return; // Evita executar o resto do script se já redirecionou
    }

    const formLoginSecretary = document.getElementById('form-login-secretary');
    const errorLoginDiv = document.getElementById('error-login-secretary');

    formLoginSecretary.addEventListener('submit', (e) => {
        e.preventDefault();
        errorLoginDiv.textContent = '';

        const email = document.getElementById('secretary-email').value.trim();
        const password = document.getElementById('secretary-password').value;

        if (!email || !password) {
            errorLoginDiv.textContent = 'Email e senha são obrigatórios.';
            return;
        }

        if (loginSecretary(email, password)) {
            window.location.href = 'secretary-dashboard.html';
        } else {
            errorLoginDiv.textContent = 'Email ou senha inválidos.';
        }
    });
});