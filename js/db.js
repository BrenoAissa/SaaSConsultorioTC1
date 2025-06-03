// js/db.js

function getFromDB(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveToDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

let pacientes = getFromDB('pacientes');
let medicos = getFromDB('medicos');
let consultas = getFromDB('consultas');

function initSecretary() {
    const secretaries = getFromDB('secretaries');
    if (secretaries.length === 0) {
        // ATENÇÃO: SENHA EM TEXTO CLARO APENAS PARA EXEMPLO DIDÁTICO!
        // Em produção, use hashing seguro e um backend.
        saveToDB('secretaries', [{ email: 'secretaria@exemplo.com', senha: '123' }]);
        console.log("Usuário secretária padrão criado: secretaria@exemplo.com / senha: 123");
    }
}
initSecretary();

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}