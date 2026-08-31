// ==========================================
// MÓDULO JS: COMPARATIVO SEMANAL E MENSAL
// ==========================================

let GLOBAL_SEMANAS_MAP = {};
let GLOBAL_SELECTED_WEEKS = [];

function formatDeltaPct(delta) {
    if (isNaN(delta) || !isFinite(delta)) return '0,0%';
    if (delta > 999) return '>+999%';
    if (delta < -999) return '<-999%';
    const sign = delta > 0 ? '+' : '';
    const formatted = Math.abs(delta).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `${sign}${delta < 0 ? '-' : ''}${formatted}%`;
}

function formatDeltaPP(deltaPP) {
    if (isNaN(deltaPP) || !isFinite(deltaPP)) return '0,0 pp';
    if (deltaPP > 999) return '>+999 pp';
    if (deltaPP < -999) return '<-999 pp';
    const sign = deltaPP > 0 ? '+' : '';
    const formatted = Math.abs(deltaPP).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `${sign}${deltaPP < 0 ? '-' : ''}${formatted} pp`;
}

function formatPctBR(num) {
    if (isNaN(num) || !isFinite(num)) return '0,0%';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
}

function getWeekInterval(dateStr, minDateObj = null, maxDateObj = null) {
    if (!dateStr) return null;
    let str = (dateStr + "").trim().split(" ")[0];
    let parts = str.split('/');
    let d;
    if (parts.length === 3) {
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
        parts = str.split('-');
        if (parts.length === 3) {
            d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
    }
    if (!d || isNaN(d.getTime())) return null;

    if (!minDateObj) {
        let day = d.getDay();
        let diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
        let monday = new Date(d.getFullYear(), d.getMonth(), diffToMonday);
        let sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = (dt) => String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0');
        return `${fmt(monday)} a ${fmt(sunday)}`;
    }

    // Normaliza para início do dia (00:00:00) para evitar problemas de fuso/horário
    let minDt = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
    let currDt = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    let diffDays = Math.floor((currDt.getTime() - minDt.getTime()) / (1000 * 60 * 60 * 24));
    let periodIdx = Math.floor(diffDays / 7);

    let startDt = new Date(minDt);
    startDt.setDate(minDt.getDate() + (periodIdx * 7));

    let endDt = new Date(startDt);
    endDt.setDate(startDt.getDate() + 6);

    if (maxDateObj) {
        let maxDt = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate());
        if (endDt > maxDt) {
            endDt = maxDt;
        }
    }

    const fmt = (dt) => String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0');
    if (startDt.getTime() === endDt.getTime()) {
        return `${fmt(startDt)}`;
    }
    return `${fmt(startDt)} a ${fmt(endDt)}`;
}

function getWeekStartDate(intervaloStr) {
    if (!intervaloStr) return 0;
    let part = intervaloStr.split(' a ')[0];
    if (!part) return 0;
    let parts = part.split('/');
    if (parts.length < 2) return 0;
    let day = parseInt(parts[0]) || 0;
    let month = parseInt(parts[1]) || 0;
    let year = new Date().getFullYear();
    return new Date(year, month - 1, day).getTime();
}

function agruparPorSemanas(records) {
    let allDates = [];
    records.forEach(r => {
        let dataRaw = getFieldValue(r, 'data');
        if (!dataRaw) return;
        let str = (dataRaw + "").trim().split(" ")[0];
        let parts = str.split('/');
        let d;
        if (parts.length === 3) {
            d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
            parts = str.split('-');
            if (parts.length === 3) {
                d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
        }
        if (d && !isNaN(d.getTime())) {
            allDates.push(d);
        }
    });

    let minDateObj = null;
    let maxDateObj = null;
    if (allDates.length > 0) {
        allDates.sort((a, b) => a - b);
        minDateObj = allDates[0];
        maxDateObj = allDates[allDates.length - 1];
    }

    const semanasMap = {};

    records.forEach(r => {
        let dataRaw = getFieldValue(r, 'data');
        let intervalo = getWeekInterval(dataRaw, minDateObj, maxDateObj);
        if (!intervalo) return;

        if (!semanasMap[intervalo]) {
            semanasMap[intervalo] = {
                intervalo: intervalo,
                cupons: new Set(),
                lojas: {},
                vendedores: {},
                linhas: {},
                categorias: {},
                vendaTotal: 0,
                descontoTotal: 0,
                margemTotal: 0,
                sumPctDesc: 0,
                countPct: 0
            };
        }

        let sem = semanasMap[intervalo];
        let nr = getFieldValue(r, 'cupom');
        if (nr) sem.cupons.add(nr);

        let codF = parseInt(getFieldValue(r, 'loja'));
        let loja = STORE_MAP[codF] ? STORE_MAP[codF] : `Loja ${codF || r.CodFilial || 'N/A'}`;
        let vend = getFieldValue(r, 'vendedor');
        let cat = getFieldValue(r, 'categoria');
        let linha = classificaLinha(cat);

        if (!sem.lojas[loja]) sem.lojas[loja] = new Set();
        if (nr) sem.lojas[loja].add(nr);

        if (!sem.vendedores[vend]) sem.vendedores[vend] = new Set();
        if (nr) sem.vendedores[vend].add(nr);

        if (!sem.linhas[linha]) sem.linhas[linha] = new Set();
        if (nr) sem.linhas[linha].add(nr);

        if (!sem.categorias[cat]) sem.categorias[cat] = new Set();
        if (nr) sem.categorias[cat].add(nr);

        let vVenda = parseStrToNum(getFieldValue(r, 'venda'));
        let vDesc = parseStrToNum(getFieldValue(r, 'desconto'));
        let vMargem = parseStrToNum(getFieldValue(r, 'margem'));
        let vPct = parseStrToNum(getFieldValue(r, 'pct'));

        if (!isNaN(vVenda)) sem.vendaTotal += vVenda;
        if (!isNaN(vDesc)) sem.descontoTotal += vDesc;
        if (!isNaN(vMargem)) sem.margemTotal += vMargem;

        if (vPct > 0 || getFieldValue(r, 'pct') != undefined) {
            sem.sumPctDesc += vPct;
            sem.countPct++;
        }
    });

    return semanasMap;
}

function fundirSemanas(semanasMap, keysArray) {
    if (!keysArray || keysArray.length === 0) return null;
    const validKeys = (Array.isArray(keysArray) ? keysArray : [keysArray]).filter(k => semanasMap[k]);
    if (validKeys.length === 0) return null;

    if (validKeys.length === 1) {
        return semanasMap[validKeys[0]];
    }

    const label = validKeys.length > 3 ? `${validKeys.length} Semanas` : validKeys.join(' + ');

    const merged = {
        intervalo: label,
        cupons: new Set(),
        lojas: {},
        vendedores: {},
        linhas: {},
        categorias: {},
        vendaTotal: 0,
        descontoTotal: 0,
        margemTotal: 0,
        sumPctDesc: 0,
        countPct: 0
    };

    validKeys.forEach(k => {
        const sem = semanasMap[k];
        if (!sem) return;

        sem.cupons.forEach(c => merged.cupons.add(c));

        Object.keys(sem.lojas).forEach(loja => {
            if (!merged.lojas[loja]) merged.lojas[loja] = new Set();
            sem.lojas[loja].forEach(c => merged.lojas[loja].add(c));
        });

        Object.keys(sem.vendedores).forEach(vend => {
            if (!merged.vendedores[vend]) merged.vendedores[vend] = new Set();
            sem.vendedores[vend].forEach(c => merged.vendedores[vend].add(c));
        });

        Object.keys(sem.linhas).forEach(linha => {
            if (!merged.linhas[linha]) merged.linhas[linha] = new Set();
            sem.linhas[linha].forEach(c => merged.linhas[linha].add(c));
        });

        Object.keys(sem.categorias).forEach(cat => {
            if (!merged.categorias[cat]) merged.categorias[cat] = new Set();
            sem.categorias[cat].forEach(c => merged.categorias[cat].add(c));
        });

        merged.vendaTotal += sem.vendaTotal;
        merged.descontoTotal += sem.descontoTotal;
        merged.margemTotal += sem.margemTotal;
        merged.sumPctDesc += sem.sumPctDesc;
        merged.countPct += sem.countPct;
    });

    return merged;
}

function processarComparativoMultiSemanas(semanasMap, selectedWeekKeys) {
    if (!semanasMap || !selectedWeekKeys || selectedWeekKeys.length === 0) return null;

    // Ordena as semanas selecionadas cronologicamente
    const semanasOrdenadas = [...selectedWeekKeys].sort((a, b) => getWeekStartDate(a) - getWeekStartDate(b));

    // 1. EVOLUÇÃO SEMANAL (KPIs E TABELA EVOLUTIVA)
    let cuponsTotaisSet = new Set();
    let vendaTotalSemanas = 0;
    let descontoTotalSemanas = 0;
    let margemTotalSemanas = 0;
    let sumPctDescSemanas = 0;
    let countPctSemanas = 0;

    const evolucaoSemanal = semanasOrdenadas.map((semKey, idx) => {
        const sem = semanasMap[semKey];
        if (!sem) return null;

        sem.cupons.forEach(c => cuponsTotaisSet.add(c));
        vendaTotalSemanas += sem.vendaTotal;
        descontoTotalSemanas += sem.descontoTotal;
        margemTotalSemanas += sem.margemTotal;
        sumPctDescSemanas += sem.sumPctDesc;
        countPctSemanas += sem.countPct;

        let pctDesc = sem.countPct ? (sem.sumPctDesc / sem.countPct) : 0;
        let deltaPrev = 0;
        if (idx > 0) {
            const prevSem = semanasMap[semanasOrdenadas[idx - 1]];
            if (prevSem && prevSem.cupons.size > 0) {
                deltaPrev = ((sem.cupons.size - prevSem.cupons.size) / prevSem.cupons.size) * 100;
            }
        }

        return {
            semana: semKey,
            cupons: sem.cupons.size,
            vendaTotal: sem.vendaTotal,
            descontoTotal: sem.descontoTotal,
            margemTotal: sem.margemTotal,
            pctDesc: pctDesc,
            deltaPrev: deltaPrev
        };
    }).filter(Boolean);

    // 2. ESTRUTURAS DE LOJAS, VENDEDORES, LINHAS E CATEGORIAS COM CONTAGENS POR SEMANA
    const todasLojasSet = new Set();
    const todosVendSet = new Set();
    const todasLinhasSet = new Set();
    const todasCatSet = new Set();

    semanasOrdenadas.forEach(semKey => {
        const sem = semanasMap[semKey];
        if (!sem) return;
        Object.keys(sem.lojas).forEach(l => todasLojasSet.add(l));
        Object.keys(sem.vendedores).forEach(v => todosVendSet.add(v));
        Object.keys(sem.linhas).forEach(ln => todasLinhasSet.add(ln));
        Object.keys(sem.categorias).forEach(c => todasCatSet.add(c));
    });

    // Lojas
    const lojasData = Array.from(todasLojasSet).map(loja => {
        const porSemana = {};
        let total = 0;
        semanasOrdenadas.forEach(semKey => {
            const count = semanasMap[semKey]?.lojas[loja]?.size || 0;
            porSemana[semKey] = count;
            total += count;
        });
        return { loja, porSemana, total };
    }).sort((a, b) => b.total - a.total);

    // Vendedores
    const vendedoresData = Array.from(todosVendSet).map(vend => {
        const porSemana = {};
        let total = 0;
        semanasOrdenadas.forEach(semKey => {
            const count = semanasMap[semKey]?.vendedores[vend]?.size || 0;
            porSemana[semKey] = count;
            total += count;
        });
        return { vend, porSemana, total };
    }).sort((a, b) => b.total - a.total);

    // Linhas
    const linhasData = Array.from(todasLinhasSet).map(linha => {
        const porSemana = {};
        let total = 0;
        semanasOrdenadas.forEach(semKey => {
            const count = semanasMap[semKey]?.linhas[linha]?.size || 0;
            porSemana[semKey] = count;
            total += count;
        });
        return { linha, porSemana, total };
    }).sort((a, b) => b.total - a.total);

    // Categorias
    const categoriasData = Array.from(todasCatSet).map(cat => {
        const porSemana = {};
        let total = 0;
        semanasOrdenadas.forEach(semKey => {
            const count = semanasMap[semKey]?.categorias[cat]?.size || 0;
            porSemana[semKey] = count;
            total += count;
        });
        return { cat, porSemana, total };
    }).sort((a, b) => b.total - a.total);

    return {
        semanasSelecionadas: semanasOrdenadas,
        totais: {
            cupons: cuponsTotaisSet.size,
            venda: vendaTotalSemanas,
            desconto: descontoTotalSemanas,
            margem: margemTotalSemanas,
            pctDescMedio: countPctSemanas ? (sumPctDescSemanas / countPctSemanas) : 0
        },
        evolucaoSemanal,
        lojas: lojasData,
        vendedores: vendedoresData,
        linhas: linhasData,
        categorias: categoriasData
    };
}

function renderComparativoDashboard(compMultiRes) {
    if (!compMultiRes) return;

    const fmtK = (val) => (val / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k';
    const semanas = compMultiRes.semanasSelecionadas;

    // 1. RENDERIZAR KPIs GERAIS
    document.getElementById('comp-kpi-cupons').innerText = compMultiRes.totais.cupons.toLocaleString('pt-BR');
    document.getElementById('comp-badge-cupons').innerText = `${semanas.length} Semanas`;

    document.getElementById('comp-kpi-vendido').innerText = `R$ ${fmtK(compMultiRes.totais.venda)}`;
    document.getElementById('comp-badge-vendido').innerText = `Total Período`;

    document.getElementById('comp-kpi-desconto').innerText = `R$ ${fmtK(compMultiRes.totais.desconto)}`;
    document.getElementById('comp-badge-desconto').innerText = `Total Período`;

    const elMargem = document.getElementById('comp-kpi-margem');
    if (elMargem) {
        elMargem.innerText = `R$ ${fmtK(compMultiRes.totais.margem)}`;
        document.getElementById('comp-badge-margem').innerText = `Total Período`;
    }

    const elPct = document.getElementById('comp-kpi-pct-desc');
    if (elPct) {
        elPct.innerText = formatPctBR(compMultiRes.totais.pctDescMedio);
        document.getElementById('comp-badge-pct-desc').innerText = `Média Ponderada`;
    }

    // 2. TABELA EVOLUTIVA POR SEMANA
    const tbodyEvol = document.getElementById('tbody-comp-evolucao');
    if (tbodyEvol) {
        tbodyEvol.innerHTML = compMultiRes.evolucaoSemanal.map(ev => `
            <tr>
                <td><strong>📅 ${ev.semana}</strong></td>
                <td><strong>${ev.cupons.toLocaleString('pt-BR')}</strong> cupons</td>
                <td>R$ ${ev.vendaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="color: var(--color-red);">R$ ${ev.descontoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="color: var(--color-red);">${formatPctBR(ev.pctDesc)}</td>
                <td style="color: var(--color-green);">R$ ${ev.margemTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                    <span class="delta-badge ${ev.deltaPrev > 0 ? 'red' : ev.deltaPrev < 0 ? 'green' : 'neutral'}">
                        ${ev.deltaPrev !== 0 ? formatDeltaPct(ev.deltaPrev) : '-'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // 3. TABELA DE LOJAS MULTI-COLUNAS
    const theadLojas = document.getElementById('thead-comp-lojas');
    if (theadLojas) {
        theadLojas.innerHTML = `
            <tr>
                <th>Loja / Unidade</th>
                ${semanas.map(s => `<th>${s}</th>`).join('')}
                <th>Total Cupons</th>
            </tr>
        `;
    }
    const tbodyLojas = document.getElementById('tbody-comp-lojas');
    if (tbodyLojas) {
        tbodyLojas.innerHTML = compMultiRes.lojas.slice(0, 15).map(l => `
            <tr>
                <td><strong>${l.loja}</strong></td>
                ${semanas.map(s => `<td>${l.porSemana[s] || 0} cupons</td>`).join('')}
                <td><strong>${l.total.toLocaleString('pt-BR')}</strong></td>
            </tr>
        `).join('');
    }

    // 4. TABELA DE VENDEDORES MULTI-COLUNAS
    const theadVend = document.getElementById('thead-comp-vendedores');
    if (theadVend) {
        theadVend.innerHTML = `
            <tr>
                <th>Vendedor</th>
                ${semanas.map(s => `<th>${s}</th>`).join('')}
                <th>Total Cupons</th>
            </tr>
        `;
    }
    const tbodyVend = document.getElementById('tbody-comp-vendedores');
    if (tbodyVend) {
        tbodyVend.innerHTML = compMultiRes.vendedores.slice(0, 15).map(v => `
            <tr>
                <td><strong>${v.vend}</strong></td>
                ${semanas.map(s => `<td>${v.porSemana[s] || 0} cupons</td>`).join('')}
                <td><strong>${v.total.toLocaleString('pt-BR')}</strong></td>
            </tr>
        `).join('');
    }

    // 5. TABELA DE LINHAS MULTI-COLUNAS
    const theadLinhas = document.getElementById('thead-comp-linhas');
    if (theadLinhas) {
        theadLinhas.innerHTML = `
            <tr>
                <th>Linha de Medicamento</th>
                ${semanas.map(s => `<th>${s}</th>`).join('')}
                <th>Total Cupons</th>
            </tr>
        `;
    }
    const tbodyLinhas = document.getElementById('tbody-comp-linhas');
    if (tbodyLinhas) {
        tbodyLinhas.innerHTML = compMultiRes.linhas.map(ln => `
            <tr>
                <td><strong>${ln.linha}</strong></td>
                ${semanas.map(s => `<td>${ln.porSemana[s] || 0} cupons</td>`).join('')}
                <td><strong>${ln.total.toLocaleString('pt-BR')}</strong></td>
            </tr>
        `).join('');
    }

    // 6. RENDERIZAR GRÁFICOS MULTI-BARRAS (UMA BARRAS POR SEMANA SELECIONADA)
    // Gráfico Lojas
    const top10Lojas = compMultiRes.lojas.slice(0, 10);
    const lojaLabels = top10Lojas.map(l => l.loja.replace(/^\d+\s*-\s*/, ''));
    const lojaValuesMap = {};
    semanas.forEach(s => {
        lojaValuesMap[s] = top10Lojas.map(l => l.porSemana[s] || 0);
    });
    drawMultiBarChart('chartCompLojas', lojaLabels, semanas, lojaValuesMap);

    // Gráfico Vendedores
    const top10Vend = compMultiRes.vendedores.slice(0, 10);
    const vendLabels = top10Vend.map(v => v.vend);
    const vendValuesMap = {};
    semanas.forEach(s => {
        vendValuesMap[s] = top10Vend.map(v => v.porSemana[s] || 0);
    });
    drawMultiBarChart('chartCompVend', vendLabels, semanas, vendValuesMap);

    // Gráfico Linhas
    const linhaLabels = compMultiRes.linhas.map(ln => ln.linha);
    const linhaValuesMap = {};
    semanas.forEach(s => {
        linhaValuesMap[s] = compMultiRes.linhas.map(ln => ln.porSemana[s] || 0);
    });
    drawMultiBarChart('chartCompLinhas', linhaLabels, semanas, linhaValuesMap);

    // Gráfico Categorias
    const top10Cat = compMultiRes.categorias.slice(0, 10);
    const catLabels = top10Cat.map(c => c.cat.substring(0, 18));
    const catValuesMap = {};
    semanas.forEach(s => {
        catValuesMap[s] = top10Cat.map(c => c.porSemana[s] || 0);
    });
    drawMultiBarChart('chartCompCat', catLabels, semanas, catValuesMap);
}

const BAR_PALETTE = [
    '#378ADD', // Azul
    '#E74C3C', // Vermelho
    '#2ECC71', // Verde
    '#F39C12', // Laranja
    '#9B59B6', // Roxo
    '#1ABC9C'  // Turquesa
];

function drawMultiBarChart(ctxId, labels, selectedWeekKeys, datasetValuesMap) {
    const elCanvas = document.getElementById(ctxId);
    if (!elCanvas) return;

    if (chartsObj[ctxId]) chartsObj[ctxId].destroy();

    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#e5e5e5';

    const datasets = selectedWeekKeys.map((semKey, idx) => ({
        label: semKey,
        data: datasetValuesMap[semKey] || [],
        backgroundColor: BAR_PALETTE[idx % BAR_PALETTE.length],
        borderRadius: 4
    }));

    chartsObj[ctxId] = new Chart(elCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: textColor } },
                datalabels: { display: false }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });
}
