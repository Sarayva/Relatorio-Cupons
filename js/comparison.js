// ==========================================
// MÓDULO JS: COMPARATIVO SEMANAL E MENSAL
// ==========================================

let GLOBAL_SEMANAS_MAP = {};

function getWeekInterval(dateStr) {
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

    let day = d.getDay();
    let diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    let monday = new Date(d.getFullYear(), d.getMonth(), diffToMonday);

    let sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (dt) => String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0');
    return `${fmt(monday)} a ${fmt(sunday)}`;
}

function getWeekStartDate(intervaloStr) {
    if (!intervaloStr) return 0;
    let part = intervaloStr.split(' a ')[0];
    if (!part) return 0;
    let parts = part.split('/');
    if (parts.length < 2) return 0;
    let day = parseInt(parts[0]) || 0;
    let month = parseInt(parts[1]) || 0;
    return month * 100 + day;
}

function agruparPorSemanas(records) {
    const semanasMap = {};

    records.forEach(r => {
        let intervalo = getWeekInterval(r.DataVenda);
        if (!intervalo) return;

        if (!semanasMap[intervalo]) {
            semanasMap[intervalo] = {
                intervalo: intervalo,
                cupons: new Set(),
                lojas: {},
                vendedores: {},
                vendaTotal: 0,
                descontoTotal: 0
            };
        }

        let sem = semanasMap[intervalo];
        let nr = r.NrCupom;
        if (nr) sem.cupons.add(nr);

        let codF = parseInt(r.CodFilial);
        let loja = STORE_MAP[codF] ? STORE_MAP[codF] : `Loja ${r.CodFilial}`;
        let vend = r.NmVendedor || 'N/A';

        if (!sem.lojas[loja]) sem.lojas[loja] = new Set();
        if (nr) sem.lojas[loja].add(nr);

        if (!sem.vendedores[vend]) sem.vendedores[vend] = new Set();
        if (nr) sem.vendedores[vend].add(nr);

        let vVenda = parseStrToNum(r.VlrVenda);
        let vDesc = parseStrToNum(r.VlrDescItens);
        if (!isNaN(vVenda)) sem.vendaTotal += vVenda;
        if (!isNaN(vDesc)) sem.descontoTotal += vDesc;
    });

    return semanasMap;
}

function calcularComparativoSemanal(semanasMap, semKeyA, semKeyB) {
    const semA = semanasMap[semKeyA];
    const semB = semanasMap[semKeyB];

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

    const todasLojas = new Set([...Object.keys(semA.lojas), ...Object.keys(semB.lojas)]);
    const comparativoLojas = [];

    todasLojas.forEach(loja => {
        let cA = semA.lojas[loja] ? semA.lojas[loja].size : 0;
        let cB = semB.lojas[loja] ? semB.lojas[loja].size : 0;
        let delta = calcDelta(cA, cB);
        let statusClass = delta > 0 ? 'red' : delta < 0 ? 'green' : 'neutral';
        let statusLabel = delta > 0 ? '🔴 Aumento (Alerta)' : delta < 0 ? '🟢 Redução (Bom)' : '🟡 Estável';
        comparativoLojas.push({ loja, cA, cB, deltaNum: delta, deltaStr: (delta > 0 ? '+' : '') + delta.toFixed(1) + '%', statusClass, statusLabel });
    });

    comparativoLojas.sort((a, b) => b.cB - a.cB);

    const todosVends = new Set([...Object.keys(semA.vendedores), ...Object.keys(semB.vendedores)]);
    const comparativoVendedores = [];

    todosVends.forEach(vend => {
        let cA = semA.vendedores[vend] ? semA.vendedores[vend].size : 0;
        let cB = semB.vendedores[vend] ? semB.vendedores[vend].size : 0;
        let delta = calcDelta(cA, cB);
        let statusClass = delta > 0 ? 'red' : delta < 0 ? 'green' : 'neutral';
        let statusLabel = delta > 0 ? '🔴 Aumento (Alerta)' : delta < 0 ? '🟢 Redução (Bom)' : '🟡 Estável';
        comparativoVendedores.push({ vend, cA, cB, deltaNum: delta, deltaStr: (delta > 0 ? '+' : '') + delta.toFixed(1) + '%', statusClass, statusLabel });
    });

    comparativoVendedores.sort((a, b) => b.cB - a.cB);

    return {
        semanaBase: semKeyA,
        semanaComparada: semKeyB,
        geral: {
            cuponsA: qteA,
            cuponsB: qteB,
            deltaCupons: deltaCupons,
            vendaA: vA,
            vendaB: vB,
            deltaVenda: deltaVenda,
            descontoA: dA,
            descontoB: dB,
            deltaDesconto: deltaDesconto
        },
        lojas: comparativoLojas,
        vendedores: comparativoVendedores
    };
}

function processarDoisMeses(recordsA, recordsB, labelMesA = "Mês Base", labelMesB = "Mês Alvo") {
    const mapA = { cupons: new Set(), lojas: {}, vendedores: {}, vendaTotal: 0, descontoTotal: 0 };
    const mapB = { cupons: new Set(), lojas: {}, vendedores: {}, vendaTotal: 0, descontoTotal: 0 };

    const processarMes = (recs, targetMap) => {
        recs.forEach(r => {
            let nr = r.NrCupom;
            if (nr) targetMap.cupons.add(nr);

            let codF = parseInt(r.CodFilial);
            let loja = STORE_MAP[codF] ? STORE_MAP[codF] : `Loja ${r.CodFilial}`;
            let vend = r.NmVendedor || 'N/A';

            if (!targetMap.lojas[loja]) targetMap.lojas[loja] = new Set();
            if (nr) targetMap.lojas[loja].add(nr);

            if (!targetMap.vendedores[vend]) targetMap.vendedores[vend] = new Set();
            if (nr) targetMap.vendedores[vend].add(nr);

            let vVenda = parseStrToNum(r.VlrVenda);
            let vDesc = parseStrToNum(r.VlrDescItens);
            if (!isNaN(vVenda)) targetMap.vendaTotal += vVenda;
            if (!isNaN(vDesc)) targetMap.descontoTotal += vDesc;
        });
    };

    processarMes(recordsA, mapA);
    processarMes(recordsB, mapB);

    const mesesMap = {
        [labelMesA]: { cupons: mapA.cupons, lojas: mapA.lojas, vendedores: mapA.vendedores, vendaTotal: mapA.vendaTotal, descontoTotal: mapA.descontoTotal },
        [labelMesB]: { cupons: mapB.cupons, lojas: mapB.lojas, vendedores: mapB.vendedores, vendaTotal: mapB.vendaTotal, descontoTotal: mapB.descontoTotal }
    };

    return {
        mesesMap: mesesMap,
        resultado: calcularComparativoSemanal(mesesMap, labelMesA, labelMesB)
    };
}

function renderComparativoDashboard(compRes) {
    if (!compRes) return;

    document.getElementById('comp-kpi-cupons').innerText = `${compRes.geral.cuponsA.toLocaleString('pt-BR')} ➔ ${compRes.geral.cuponsB.toLocaleString('pt-BR')}`;
    const badgeC = document.getElementById('comp-badge-cupons');
    let dC = compRes.geral.deltaCupons;
    badgeC.innerText = (dC > 0 ? '+' : '') + dC.toFixed(1) + '%';
    badgeC.className = 'delta-badge ' + (dC > 0 ? 'red' : dC < 0 ? 'green' : 'neutral');

    document.getElementById('comp-kpi-vendido').innerText = `R$ ${(compRes.geral.vendaA / 1000).toFixed(1)}k ➔ R$ ${(compRes.geral.vendaB / 1000).toFixed(1)}k`;
    const badgeV = document.getElementById('comp-badge-vendido');
    let dV = compRes.geral.deltaVenda;
    badgeV.innerText = (dV > 0 ? '+' : '') + dV.toFixed(1) + '%';
    badgeV.className = 'delta-badge ' + (dV > 0 ? 'green' : dV < 0 ? 'red' : 'neutral');

    document.getElementById('comp-kpi-desconto').innerText = `R$ ${(compRes.geral.descontoA / 1000).toFixed(1)}k ➔ R$ ${(compRes.geral.descontoB / 1000).toFixed(1)}k`;
    const badgeD = document.getElementById('comp-badge-desconto');
    let dD = compRes.geral.deltaDesconto;
    badgeD.innerText = (dD > 0 ? '+' : '') + dD.toFixed(1) + '%';
    badgeD.className = 'delta-badge ' + (dD > 0 ? 'red' : dD < 0 ? 'green' : 'neutral');

    document.getElementById('th-sem-base-loja').innerText = compRes.semanaBase;
    document.getElementById('th-sem-target-loja').innerText = compRes.semanaComparada;
    document.getElementById('th-sem-base-vend').innerText = compRes.semanaBase;
    document.getElementById('th-sem-target-vend').innerText = compRes.semanaComparada;

    const tbodyLojas = document.getElementById('tbody-comp-lojas');
    tbodyLojas.innerHTML = compRes.lojas.slice(0, 15).map(l => `
        <tr>
            <td><strong>${l.loja}</strong></td>
            <td>${l.cA.toLocaleString('pt-BR')} cupons</td>
            <td>${l.cB.toLocaleString('pt-BR')} cupons</td>
            <td><span class="delta-badge ${l.statusClass}">${l.deltaStr}</span></td>
            <td>${l.statusLabel}</td>
        </tr>
    `).join('');

    const tbodyVend = document.getElementById('tbody-comp-vendedores');
    tbodyVend.innerHTML = compRes.vendedores.slice(0, 15).map(v => `
        <tr>
            <td><strong>${v.vend}</strong></td>
            <td>${v.cA.toLocaleString('pt-BR')} cupons</td>
            <td>${v.cB.toLocaleString('pt-BR')} cupons</td>
            <td><span class="delta-badge ${v.statusClass}">${v.deltaStr}</span></td>
            <td>${v.statusLabel}</td>
        </tr>
    `).join('');

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
}

function drawDoubleBarChart(ctxId, labels, labelA, dataA, labelB, dataB) {
    if (chartsObj[ctxId]) chartsObj[ctxId].destroy();

    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#e5e5e5';

    chartsObj[ctxId] = new Chart(document.getElementById(ctxId), {
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
