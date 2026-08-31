// ==========================================
// MÓDULO JS: CORE APP (LEITURA, TEMAS E TABS)
// ==========================================

let isDarkTheme = true;
let GLOBAL_RECORDS = [];
let GLOBAL_EXPORT_DATA = {};
let chartsObj = {};
let tempDualFileA = null;

Chart.register(ChartDataLabels);
Chart.defaults.font.family = "'Inter', sans-serif";

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initBrandHomeNav();
    initTabSwitching();
    initFileInputs();
    initDragAndDrop();
});

function initThemeToggle() {
    const heroLogo = document.getElementById('hero-logo-img');
    const dashLogo = document.getElementById('dash-logo');
    const toggleButtons = document.querySelectorAll('.btn-toggle-trigger');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            isDarkTheme = !isDarkTheme;

            if (isDarkTheme) {
                document.body.classList.remove('light-theme');
                if (heroLogo) heroLogo.src = 'imagens/para fundo claro.png';
                if (dashLogo) dashLogo.src = 'imagens/para fundo claro.png';
                toggleButtons.forEach(b => {
                    b.querySelector('.theme-btn-icon').innerText = '☀️';
                    b.querySelector('.theme-btn-label').innerText = 'Modo Claro';
                });
            } else {
                document.body.classList.add('light-theme');
                if (heroLogo) heroLogo.src = 'imagens/para fundo branco.png';
                if (dashLogo) dashLogo.src = 'imagens/para fundo branco.png';
                toggleButtons.forEach(b => {
                    b.querySelector('.theme-btn-icon').innerText = '🌙';
                    b.querySelector('.theme-btn-label').innerText = 'Modo Escuro';
                });
            }

            if (GLOBAL_RECORDS.length > 0) {
                calcularDashboard(GLOBAL_RECORDS);
            }
            if (GLOBAL_SEMANAS_MAP && Object.keys(GLOBAL_SEMANAS_MAP).length > 0) {
                const selectBase = document.getElementById('select-week-base');
                const selectTarget = document.getElementById('select-week-target');
                if (selectBase && selectTarget && selectBase.value && selectTarget.value) {
                    const updatedComp = calcularComparativoSemanal(GLOBAL_SEMANAS_MAP, selectBase.value, selectTarget.value);
                    renderComparativoDashboard(updatedComp);
                }
            }
        });
    });
}

function initBrandHomeNav() {
    const headerBrand = document.querySelector('.header-brand');
    if (headerBrand) {
        headerBrand.addEventListener('click', () => {
            tempDualFileA = null;
            document.getElementById('dash-header').classList.add('hidden');
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('view-mode-bar').classList.add('hidden');
            document.getElementById('hero-screen').style.display = 'flex';
            
            const fileInput = document.getElementById('file-input');
            const fileInputDual = document.getElementById('file-input-dual');
            if (fileInput) fileInput.value = '';
            if (fileInputDual) fileInputDual.value = '';

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initTabSwitching() {
    const tabOverview = document.getElementById('tab-overview');
    const tabComparison = document.getElementById('tab-comparison');
    const overviewView = document.getElementById('overview-view');
    const comparisonView = document.getElementById('comparison-view');
    const compSelectors = document.getElementById('comparison-selectors');

    if (tabOverview && tabComparison) {
        tabOverview.addEventListener('click', () => {
            tabOverview.classList.add('active');
            tabComparison.classList.remove('active');
            overviewView.classList.remove('hidden');
            comparisonView.classList.add('hidden');
            if (compSelectors) compSelectors.classList.add('hidden');
        });

        tabComparison.addEventListener('click', () => {
            tabComparison.classList.add('active');
            tabOverview.classList.remove('active');
            comparisonView.classList.remove('hidden');
            overviewView.classList.add('hidden');
            if (compSelectors) compSelectors.classList.remove('hidden');
        });
    }
}

function initFileInputs() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', e => {
            if (e.target.files.length) processFile(e.target.files[0]);
        });
    }

    const fileInputDual = document.getElementById('file-input-dual');
    if (fileInputDual) {
        fileInputDual.addEventListener('change', e => {
            const files = Array.from(e.target.files);
            if (files.length >= 2) {
                tempDualFileA = null;
                processDualFiles(files[0], files[1]);
                fileInputDual.value = '';
            } else if (files.length === 1) {
                if (!tempDualFileA) {
                    tempDualFileA = files[0];
                    fileInputDual.value = '';
                    alert(`1º Arquivo Selecionado: "${tempDualFileA.name}"!\n\nAgora selecione o 2º arquivo de mês fechado para comparar.`);
                    setTimeout(() => fileInputDual.click(), 300);
                } else {
                    const fileB = files[0];
                    const fileA = tempDualFileA;
                    tempDualFileA = null;
                    fileInputDual.value = '';
                    processDualFiles(fileA, fileB);
                }
            }
        });
    }

    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', exportarExcelProfissional);
    }
}

function initDragAndDrop() {
    const heroScreen = document.getElementById('hero-screen');
    if (!heroScreen) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, e => e.preventDefault());
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        heroScreen.addEventListener(eventName, () => heroScreen.classList.add('dragover'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
        heroScreen.addEventListener(eventName, () => heroScreen.classList.remove('dragover'));
    });

    window.addEventListener('drop', e => {
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files);
            if (files.length >= 2) {
                tempDualFileA = null;
                processDualFiles(files[0], files[1]);
            } else if (files.length === 1) {
                if (!tempDualFileA) {
                    tempDualFileA = files[0];
                    alert(`1º Arquivo Recebido: "${tempDualFileA.name}"!\n\nAgora solte ou selecione o 2º arquivo de mês fechado para comparar.`);
                } else {
                    const fileB = files[0];
                    const fileA = tempDualFileA;
                    tempDualFileA = null;
                    processDualFiles(fileA, fileB);
                }
            }
        }
    });
}

function parseExcelRecords(sheetData) {
    let headerIdx = -1;

    // Busca a linha que tem pelo menos 3 celulas preenchidas E contem nomes de colunas
    for (let i = 0; i < Math.min(sheetData.length, 30); i++) {
        const row = sheetData[i];
        if (!row || !Array.isArray(row)) continue;

        const filledCells = row.filter(c => c !== undefined && c !== null && String(c).trim() !== '');
        if (filledCells.length < 3) continue; // Pula titulos e celulas mescladas unicas

        const rowStr = JSON.stringify(row).toUpperCase();
        if (
            rowStr.includes("CUPOM") || 
            rowStr.includes("VENDEDOR") || 
            rowStr.includes("CATEGOR") || 
            rowStr.includes("FILIAL") || 
            rowStr.includes("LOJA") || 
            rowStr.includes("NVR") ||
            rowStr.includes("VENDA") ||
            rowStr.includes("DESCONTO")
        ) {
            headerIdx = i;
            break;
        }
    }

    if (headerIdx === -1) {
        for (let i = 0; i < Math.min(sheetData.length, 20); i++) {
            const row = sheetData[i];
            if (row && Array.isArray(row)) {
                const filled = row.filter(c => c !== undefined && c !== null && String(c).trim() !== '');
                if (filled.length >= 3) {
                    headerIdx = i;
                    break;
                }
            }
        }
    }

    if (headerIdx === -1) headerIdx = 0;

    const headers = sheetData[headerIdx].map(h => String(h || '').trim());
    const rawRows = sheetData.slice(headerIdx + 1);

    const ffilled = [];
    let lastSeen = {};

    rawRows.forEach(row => {
        if (!row || row.length === 0) return;

        const rowStr = JSON.stringify(row).toUpperCase();
        if (
            rowStr.includes("TOTAIS") || 
            rowStr.includes("TOTAL") || 
            rowStr.includes("USUÁRIO:") || 
            rowStr.includes("USUARIO:") || 
            rowStr.includes("PDV_RESUMO_FILIAL") ||
            rowStr.includes("ÁRVORE MERCADOLÓGICA") ||
            rowStr.includes("ARVORE MERCADOLOGICA")
        ) {
            return;
        }

        let obj = {};
        let hasValue = false;

        headers.forEach((h, colIdx) => {
            if (!h) return;
            let val = row[colIdx];

            if (val !== undefined && val !== null && String(val).trim() !== '') {
                obj[h] = val;
                lastSeen[h] = val;
                hasValue = true;
            } else {
                let hUpper = h.toUpperCase();
                if (
                    hUpper.includes('FILIAL') || 
                    hUpper.includes('LOJA') || 
                    hUpper.includes('DATA') || 
                    hUpper.includes('CUPOM') || 
                    hUpper.includes('VENDEDOR') ||
                    hUpper.includes('CATEGOR') ||
                    hUpper.includes('GRUPO') ||
                    hUpper.includes('SECAO') ||
                    hUpper.includes('SECÂO') ||
                    hUpper.includes('DEPARTAM') ||
                    hUpper.includes('TIPO')
                ) {
                    obj[h] = lastSeen[h];
                } else {
                    obj[h] = val;
                }
            }
        });

        if (hasValue) ffilled.push(obj);
    });

    return ffilled;
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const records = parseExcelRecords(json);
                resolve(records);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = err => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

async function processFile(file) {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('hero-screen').style.display = 'none';

    try {
        const records = await readExcelFile(file);
        GLOBAL_RECORDS = records;

        document.getElementById('dash-header').classList.remove('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('btn-export').disabled = false;

        // Calcular Visão Geral
        calcularDashboard(GLOBAL_RECORDS);

        // Processar Semanas
        GLOBAL_SEMANAS_MAP = agruparPorSemanas(GLOBAL_RECORDS);

        // Ordenar semanas cronologicamente (da menor data para a maior)
        const listaSemanas = Object.keys(GLOBAL_SEMANAS_MAP).sort((a, b) => getWeekStartDate(a) - getWeekStartDate(b));

        const viewModeBar = document.getElementById('view-mode-bar');
        const selectBase = document.getElementById('select-week-base');
        const selectTarget = document.getElementById('select-week-target');

        if (listaSemanas.length >= 2) {
            viewModeBar.classList.remove('hidden');

            const optionsBaseContainer = document.getElementById('options-ms-base');
            const optionsTargetContainer = document.getElementById('options-ms-target');
            const btnMsBase = document.getElementById('btn-ms-base');
            const btnMsTarget = document.getElementById('btn-ms-target');
            const dropdownBase = document.getElementById('dropdown-ms-base');
            const dropdownTarget = document.getElementById('dropdown-ms-target');
            const labelBase = document.getElementById('label-ms-base');
            const labelTarget = document.getElementById('label-ms-target');

            // Render options
            optionsBaseContainer.innerHTML = listaSemanas.map((s, idx) => `
                <label class="ms-option-label">
                    <input type="checkbox" value="${s}" ${idx === 0 ? 'checked' : ''}>
                    <span>${s}</span>
                </label>
            `).join('');

            optionsTargetContainer.innerHTML = listaSemanas.map((s, idx) => `
                <label class="ms-option-label">
                    <input type="checkbox" value="${s}" ${idx === 1 || (listaSemanas.length === 1 && idx === 0) ? 'checked' : ''}>
                    <span>${s}</span>
                </label>
            `).join('');

            const updateSelection = () => {
                const checkedBase = Array.from(optionsBaseContainer.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
                const checkedTarget = Array.from(optionsTargetContainer.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);

                // Guarantee at least 1 checked
                if (checkedBase.length === 0) {
                    optionsBaseContainer.querySelector('input[type="checkbox"]').checked = true;
                    checkedBase.push(listaSemanas[0]);
                }
                if (checkedTarget.length === 0) {
                    const fallbackIdx = listaSemanas.length > 1 ? 1 : 0;
                    optionsTargetContainer.querySelectorAll('input[type="checkbox"]')[fallbackIdx].checked = true;
                    checkedTarget.push(listaSemanas[fallbackIdx]);
                }

                GLOBAL_SELECTED_BASE_WEEKS = checkedBase;
                GLOBAL_SELECTED_TARGET_WEEKS = checkedTarget;

                // Update Button Labels
                if (checkedBase.length === listaSemanas.length) {
                    labelBase.innerText = `Todas (${checkedBase.length})`;
                } else if (checkedBase.length === 1) {
                    labelBase.innerText = checkedBase[0];
                } else {
                    labelBase.innerText = `${checkedBase.length} Semanas`;
                }

                if (checkedTarget.length === listaSemanas.length) {
                    labelTarget.innerText = `Todas (${checkedTarget.length})`;
                } else if (checkedTarget.length === 1) {
                    labelTarget.innerText = checkedTarget[0];
                } else {
                    labelTarget.innerText = `${checkedTarget.length} Semanas`;
                }

                const compRes = calcularComparativoSemanal(GLOBAL_SEMANAS_MAP, checkedBase, checkedTarget);
                renderComparativoDashboard(compRes);
            };

            // Event Listeners for dropdown buttons
            btnMsBase.onclick = (e) => {
                e.stopPropagation();
                dropdownBase.classList.toggle('hidden');
                dropdownTarget.classList.add('hidden');
            };

            btnMsTarget.onclick = (e) => {
                e.stopPropagation();
                dropdownTarget.classList.toggle('hidden');
                dropdownBase.classList.add('hidden');
            };

            // Event Listeners for Checkbox changes
            optionsBaseContainer.onchange = updateSelection;
            optionsTargetContainer.onchange = updateSelection;

            // Action Buttons
            document.getElementById('btn-all-base').onclick = (e) => {
                e.stopPropagation();
                optionsBaseContainer.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = true);
                updateSelection();
            };

            document.getElementById('btn-clear-base').onclick = (e) => {
                e.stopPropagation();
                optionsBaseContainer.querySelectorAll('input[type="checkbox"]').forEach((c, idx) => c.checked = idx === 0);
                updateSelection();
            };

            document.getElementById('btn-all-target').onclick = (e) => {
                e.stopPropagation();
                optionsTargetContainer.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = true);
                updateSelection();
            };

            document.getElementById('btn-clear-target').onclick = (e) => {
                e.stopPropagation();
                optionsTargetContainer.querySelectorAll('input[type="checkbox"]').forEach((c, idx) => c.checked = idx === (listaSemanas.length > 1 ? 1 : 0));
                updateSelection();
            };

            // Close dropdowns on outside click
            if (!window.msOutsideClickListening) {
                window.msOutsideClickListening = true;
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.multi-select-container')) {
                        const dBase = document.getElementById('dropdown-ms-base');
                        const dTarget = document.getElementById('dropdown-ms-target');
                        if (dBase) dBase.classList.add('hidden');
                        if (dTarget) dTarget.classList.add('hidden');
                    }
                });
            }

            // Initial call to set labels & render
            updateSelection();

        } else {
            viewModeBar.classList.add('hidden');
        }

    } catch (err) {
        console.error('Erro ao ler a planilha:', err);
        alert('Ocorreu um erro ao processar o arquivo Excel: ' + err.message);
        document.getElementById('hero-screen').style.display = 'flex';
        document.getElementById('dash-header').classList.add('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

async function processDualFiles(fileA, fileB) {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('hero-screen').style.display = 'none';

    try {
        const recordsA = await readExcelFile(fileA);
        const recordsB = await readExcelFile(fileB);

        const nameA = fileA.name.replace(/\.[^/.]+$/, "").replace(/^relatorio/i, "").trim() || "Mês Base";
        const nameB = fileB.name.replace(/\.[^/.]+$/, "").replace(/^relatorio/i, "").trim() || "Mês Alvo";

        GLOBAL_RECORDS = [...recordsA, ...recordsB];

        document.getElementById('dash-header').classList.remove('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('btn-export').disabled = false;

        // Calcular Visão Geral Consolidada
        calcularDashboard(GLOBAL_RECORDS);

        // Processar Comparativo Mensal Mês A vs Mês B
        const dualRes = processarDoisMeses(recordsA, recordsB, nameA, nameB);
        GLOBAL_SEMANAS_MAP = dualRes.mesesMap;

        const viewModeBar = document.getElementById('view-mode-bar');
        const selectBase = document.getElementById('select-week-base');
        const selectTarget = document.getElementById('select-week-target');

        viewModeBar.classList.remove('hidden');
        selectBase.innerHTML = `<option value="${nameA}">${nameA}</option>`;
        selectTarget.innerHTML = `<option value="${nameB}">${nameB}</option>`;
        selectBase.value = nameA;
        selectTarget.value = nameB;

        renderComparativoDashboard(dualRes.resultado);

        // Muda automaticamente para a aba comparativa ao carregar 2 meses
        document.getElementById('tab-comparison').click();

    } catch (err) {
        console.error('Erro ao ler os 2 arquivos:', err);
        alert('Ocorreu um erro ao processar os arquivos de Análise Mensal: ' + err.message);
        document.getElementById('hero-screen').style.display = 'flex';
        document.getElementById('dash-header').classList.add('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}
