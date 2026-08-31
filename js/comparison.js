// ==========================================
// MÓDULO JS: COMPARATIVO SEMANAL E MENSAL
// ==========================================

let GLOBAL_SEMANAS_MAP = {};
let GLOBAL_SELECTED_BASE_WEEKS = [];
let GLOBAL_SELECTED_TARGET_WEEKS = [];

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

function calcularComparativoSemanal(semanasMap, semKeyA, semKeyB) {
    const keysA = Array.isArray(semKeyA) ? semKeyA : [semKeyA];
    const keysB = Array.isArray(semKeyB) ? semKeyB : [semKeyB];

    const semA = fundirSemanas(semanasMap, keysA);
    const semB = fundirSemanas(semanasMap, keysB);

    if (!semA || !semB) return null;

    const calcDelta = (valA, valB) => {
        if (valA === 0) return valB > 0 ? 100 : 0;
        return ((valB - valA) / valA) * 100;
    };

    let qteA = semA.cupons.size;
    let qteB = semB.cupons.size;
    let deltaCupons = calcDelta(qteA, qteB);

    let vA = semA.vendaTotal;
    let vB = semB.vendaTotal;
    let deltaVenda = calcDelta(vA, vB);

    let dA = semA.descontoTotal;
    let dB = semB.descontoTotal;
    let deltaDesconto = calcDelta(dA, dB);

    let mA = semA.margemTotal;
    let mB = semB.margemTotal;
    let deltaMargem = calcDelta(mA, mB);

    let pctA = semA.countPct ? (semA.sumPctDesc / semA.countPct) : 0;
    let pctB = semB.countPct ? (semB.sumPctDesc / semB.countPct) : 0;
    let deltaPctDesc = pctB - pctA; // Variação em pontos percentuais (pp)

    // COMPARATIVO LOJAS
    const todasLojas = new Set([...Object.keys(semA.lojas), ...Object.keys(semB.lojas)]);
    const comparativoLojas = [];
    todasLojas.forEach(loja => {
        let cA = semA.lojas[loja] ? semA.lojas[loja].size : 0;
        let cB = semB.lojas[loja] ? semB.lojas[loja].size : 0;
        let delta = calcDelta(cA, cB);
        let statusClass = delta > 0 ? 'red' : delta < 0 ? 'green' : 'neutral';
        let statusLabel = delta > 0 ? '🔴 Aumento (Alerta)' : delta < 0 ? '🟢 Redução (Bom)' : '🟡 Estável';
        comparativoLojas.push({ loja, cA, cB, deltaNum: delta, deltaStr: formatDeltaPct(delta), statusClass, statusLabel });
    });
    comparativoLojas.sort((a, b) => b.cB - a.cB);

    // COMPARATIVO VENDEDORES
    const todosVends = new Set([...Object.keys(semA.vendedores), ...Object.keys(semB.vendedores)]);
    const comparativoVendedores = [];
    todosVends.forEach(vend => {
        let cA = semA.vendedores[vend] ? semA.vendedores[vend].size : 0;
        let cB = semB.vendedores[vend] ? semB.vendedores[vend].size : 0;
        let delta = calcDelta(cA, cB);
        let statusClass = delta > 0 ? 'red' : delta < 0 ? 'green' : 'neutral';
        let statusLabel = delta > 0 ? '🔴 Aumento (Alerta)' : delta < 0 ? '🟢 Redução (Bom)' : '🟡 Estável';
        comparativoVendedores.push({ vend, cA, cB, deltaNum: delta, deltaStr: formatDeltaPct(delta), statusClass, statusLabel });
    });
    comparativoVendedores.sort((a, b) => b.cB - a.cB);

    // COMPARATIVO LINHAS DE MEDICAMENTO
    const todasLinhas = new Set([...Object.keys(semA.linhas), ...Object.keys(semB.linhas)]);
    const comparativoLinhas = [];
    todasLinhas.forEach(linha => {
        let cA = semA.linhas[linha] ? semA.linhas[linha].size : 0;
        let cB = semB.linhas[linha] ? semB.linhas[linha].size : 0;
        let delta = calcDelta(cA, cB);
        let statusClass = delta > 0 ? 'red' : delta < 0 ? 'green' : 'neutral';
        let statusLabel = delta > 0 ? '🔴 Aumento' : delta < 0 ? '🟢 Redução' : '🟡 Estável';
        comparativoLinhas.push({ linha, cA, cB, deltaNum: delta, deltaStr: formatDeltaPct(delta), statusClass, statusLabel });
    });
    comparativoLinhas.sort((a, b) => b.cB - a.cB);

    // COMPARATIVO CATEGORIAS
    const todasCats = new Set([...Object.keys(semA.categorias), ...Object.keys(semB.categorias)]);
    const comparativoCategorias = [];
    todasCats.forEach(cat => {
        let cA = semA.categorias[cat] ? semA.categorias[cat].size : 0;
        let cB = semB.categorias[cat] ? semB.categorias[cat].size : 0;
        let delta = calcDelta(cA, cB);
        comparativoCategorias.push({ cat, cA, cB, deltaNum: delta });
    });
    comparativoCategorias.sort((a, b) => b.cB - a.cB);

    return {
        semanaBase: semA.intervalo,
        semanaComparada: semB.intervalo,
        geral: {
            cuponsA: qteA, cuponsB: qteB, deltaCupons,
            vendaA: vA, vendaB: vB, deltaVenda,
            descontoA: dA, descontoB: dB, deltaDesconto,
            margemA: mA, margemB: mB, deltaMargem,
            pctA: pctA, pctB: pctB, deltaPctDesc
        },
        lojas: comparativoLojas,
        vendedores: comparativoVendedores,
        linhas: comparativoLinhas,
        categorias: comparativoCategorias
    };
}

function processarDoisMeses(recordsA, recordsB, labelMesA = "Mês Base", labelMesB = "Mês Alvo") {
    const mapA = { cupons: new Set(), lojas: {}, vendedores: {}, linhas: {}, categorias: {}, vendaTotal: 0, descontoTotal: 0, margemTotal: 0, sumPctDesc: 0, countPct: 0 };
    const mapB = { cupons: new Set(), lojas: {}, vendedores: {}, linhas: {}, categorias: {}, vendaTotal: 0, descontoTotal: 0, margemTotal: 0, sumPctDesc: 0, countPct: 0 };

    const processarMes = (recs, targetMap) => {
        recs.forEach(r => {
            let nr = getFieldValue(r, 'cupom');
            if (nr) targetMap.cupons.add(nr);

            let codF = parseInt(getFieldValue(r, 'loja'));
            let loja = STORE_MAP[codF] ? STORE_MAP[codF] : `Loja ${codF || r.CodFilial || 'N/A'}`;
            let vend = getFieldValue(r, 'vendedor');
            let cat = getFieldValue(r, 'categoria');
            let linha = classificaLinha(cat);

            if (!targetMap.lojas[loja]) targetMap.lojas[loja] = new Set();
            if (nr) targetMap.lojas[loja].add(nr);

            if (!targetMap.vendedores[vend]) targetMap.vendedores[vend] = new Set();
            if (nr) targetMap.vendedores[vend].add(nr);

            if (!targetMap.linhas[linha]) targetMap.linhas[linha] = new Set();
            if (nr) targetMap.linhas[linha].add(nr);

            if (!targetMap.categorias[cat]) targetMap.categorias[cat] = new Set();
            if (nr) targetMap.categorias[cat].add(nr);

            let vVenda = parseStrToNum(getFieldValue(r, 'venda'));
            let vDesc = parseStrToNum(getFieldValue(r, 'desconto'));
            let vMargem = parseStrToNum(getFieldValue(r, 'margem'));
            let vPct = parseStrToNum(getFieldValue(r, 'pct'));

            if (!isNaN(vVenda)) targetMap.vendaTotal += vVenda;
            if (!isNaN(vDesc)) targetMap.descontoTotal += vDesc;
            if (!isNaN(vMargem)) targetMap.margemTotal += vMargem;

            if (vPct > 0 || getFieldValue(r, 'pct') != undefined) {
                targetMap.sumPctDesc += vPct;
                targetMap.countPct++;
            }
        });
    };

    processarMes(recordsA, mapA);
    processarMes(recordsB, mapB);

    const mesesMap = {
        [labelMesA]: mapA,
        [labelMesB]: mapB
    };

    return {
        mesesMap: mesesMap,
        resultado: calcularComparativoSemanal(mesesMap, labelMesA, labelMesB)
    };
}

function renderComparativoDashboard(compRes) {
    if (!compRes) return;

    const fmtK = (val) => (val / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k';

    // 1. KPI CUPONS
    document.getElementById('comp-kpi-cupons').innerText = `${compRes.geral.cuponsA.toLocaleString('pt-BR')} ➔ ${compRes.geral.cuponsB.toLocaleString('pt-BR')}`;
    const badgeC = document.getElementById('comp-badge-cupons');
    let dC = compRes.geral.deltaCupons;
    badgeC.innerText = formatDeltaPct(dC);
    badgeC.className = 'delta-badge ' + (dC > 0 ? 'red' : dC < 0 ? 'green' : 'neutral');

    // 2. KPI VENDIDO
    document.getElementById('comp-kpi-vendido').innerText = `R$ ${fmtK(compRes.geral.vendaA)} ➔ R$ ${fmtK(compRes.geral.vendaB)}`;
    const badgeV = document.getElementById('comp-badge-vendido');
    let dV = compRes.geral.deltaVenda;
    badgeV.innerText = formatDeltaPct(dV);
    badgeV.className = 'delta-badge ' + (dV > 0 ? 'green' : dV < 0 ? 'red' : 'neutral');

    // 3. KPI DESCONTO
    document.getElementById('comp-kpi-desconto').innerText = `R$ ${fmtK(compRes.geral.descontoA)} ➔ R$ ${fmtK(compRes.geral.descontoB)}`;
    const badgeD = document.getElementById('comp-badge-desconto');
    let dD = compRes.geral.deltaDesconto;
    badgeD.innerText = formatDeltaPct(dD);
    badgeD.className = 'delta-badge ' + (dD > 0 ? 'red' : dD < 0 ? 'green' : 'neutral');

    // 4. KPI MARGEM
    const elMargem = document.getElementById('comp-kpi-margem');
    if (elMargem) {
        elMargem.innerText = `R$ ${fmtK(compRes.geral.margemA)} ➔ R$ ${fmtK(compRes.geral.margemB)}`;
        const badgeM = document.getElementById('comp-badge-margem');
        let dM = compRes.geral.deltaMargem;
        badgeM.innerText = formatDeltaPct(dM);
        badgeM.className = 'delta-badge ' + (dM > 0 ? 'green' : dM < 0 ? 'red' : 'neutral');
    }

    // 5. KPI PCT DESCONTO
    const elPct = document.getElementById('comp-kpi-pct-desc');
    if (elPct) {
        elPct.innerText = `${formatPctBR(compRes.geral.pctA)} ➔ ${formatPctBR(compRes.geral.pctB)}`;
        const badgeP = document.getElementById('comp-badge-pct-desc');
        let dP = compRes.geral.deltaPctDesc;
        badgeP.innerText = formatDeltaPP(dP);
        badgeP.className = 'delta-badge ' + (dP > 0 ? 'red' : dP < 0 ? 'green' : 'neutral');
    }

    // HEADERS DAS TABELAS
    ['loja', 'vend', 'linha'].forEach(prefix => {
        const hA = document.getElementById(`th-sem-base-${prefix}`);
        const hB = document.getElementById(`th-sem-target-${prefix}`);
        if (hA) hA.innerText = compRes.semanaBase;
        if (hB) hB.innerText = compRes.semanaComparada;
    });

    // TABELA LOJAS
    const tbodyLojas = document.getElementById('tbody-comp-lojas');
    if (tbodyLojas) {
        tbodyLojas.innerHTML = compRes.lojas.slice(0, 15).map(l => `
            <tr>
                <td><strong>${l.loja}</strong></td>
                <td>${l.cA.toLocaleString('pt-BR')} cupons</td>
                <td>${l.cB.toLocaleString('pt-BR')} cupons</td>
                <td><span class="delta-badge ${l.statusClass}">${l.deltaStr}</span></td>
                <td>${l.statusLabel}</td>
            </tr>
        `).join('');
    }

    // TABELA VENDEDORES
    const tbodyVend = document.getElementById('tbody-comp-vendedores');
    if (tbodyVend) {
        tbodyVend.innerHTML = compRes.vendedores.slice(0, 15).map(v => `
            <tr>
                <td><strong>${v.vend}</strong></td>
                <td>${v.cA.toLocaleString('pt-BR')} cupons</td>
                <td>${v.cB.toLocaleString('pt-BR')} cupons</td>
                <td><span class="delta-badge ${v.statusClass}">${v.deltaStr}</span></td>
                <td>${v.statusLabel}</td>
            </tr>
        `).join('');
    }

    // TABELA LINHAS
    const tbodyLinhas = document.getElementById('tbody-comp-linhas');
    if (tbodyLinhas) {
        tbodyLinhas.innerHTML = compRes.linhas.map(ln => `
            <tr>
                <td><strong>${ln.linha}</strong></td>
                <td>${ln.cA.toLocaleString('pt-BR')} cupons</td>
                <td>${ln.cB.toLocaleString('pt-BR')} cupons</td>
                <td><span class="delta-badge ${ln.statusClass}">${ln.deltaStr}</span></td>
                <td>${ln.statusLabel}</td>
            </tr>
        `).join('');
    }

    // GRÁFICOS DUPLOS
    const top10Lojas = compRes.lojas.slice(0, 10);
    drawDoubleBarChart('chartCompLojas',
        top10Lojas.map(l => l.loja.replace(/^\d+\s*-\s*/, '')),
        compRes.semanaBase, top10Lojas.map(l => l.cA),
        compRes.semanaComparada, top10Lojas.map(l => l.cB)
    );

    const top10Vend = compRes.vendedores.slice(0, 10);
    drawDoubleBarChart('chartCompVend',
        top10Vend.map(v => v.vend),
        compRes.semanaBase, top10Vend.map(v => v.cA),
        compRes.semanaComparada, top10Vend.map(v => v.cB)
    );

    drawDoubleBarChart('chartCompLinhas',
        compRes.linhas.map(ln => ln.linha),
        compRes.semanaBase, compRes.linhas.map(ln => ln.cA),
        compRes.semanaComparada, compRes.linhas.map(ln => ln.cB)
    );

    const top10Cat = compRes.categorias.slice(0, 10);
    drawDoubleBarChart('chartCompCat',
        top10Cat.map(c => c.cat.substring(0, 18)),
        compRes.semanaBase, top10Cat.map(c => c.cA),
        compRes.semanaComparada, top10Cat.map(c => c.cB)
    );
}

function drawDoubleBarChart(ctxId, labels, labelA, dataA, labelB, dataB) {
    const elCanvas = document.getElementById(ctxId);
    if (!elCanvas) return;

    if (chartsObj[ctxId]) chartsObj[ctxId].destroy();

    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#e5e5e5';

    chartsObj[ctxId] = new Chart(elCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: labelA,
                    data: dataA,
                    backgroundColor: '#378ADD',
                    borderRadius: 4
                },
                {
                    label: labelB,
                    data: dataB,
                    backgroundColor: '#C0392B',
                    borderRadius: 4
                }
            ]
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
