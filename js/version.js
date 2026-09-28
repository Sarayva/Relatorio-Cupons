// ==========================================
// MÓDULO JS: VERSÃO DA APLICAÇÃO
// ==========================================
// Semantic Versioning (MAJOR.MINOR.PATCH):
//   MAJOR: mudança incompatível (ex.: novo layout de planilha obrigatório)
//   MINOR: nova funcionalidade
//   PATCH: correção de bug
// Ao alterar, registre a mudança no CHANGELOG.md.

const APP_VERSION = '1.1.0';

function renderAppVersion() {
    document.querySelectorAll('[data-app-version]').forEach(el => {
        el.textContent = `v${APP_VERSION}`;
    });
}
