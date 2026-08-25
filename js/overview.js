// ==========================================
// MÓDULO JS: VISÃO GERAL (OVERVIEW)
// ==========================================

const STORE_MAP = {
    2: "002 - CERRO AZUL", 3: "003 - BORBA GATO", 4: "004 - OPERÁRIA",
    6: "006 - 24HORAS", 7: "007 - PEDRO TAQUES", 8: "008 - SARANDI",
    9: "009 - PRAÇA", 10: "010 - TEIXEIRA MENDES", 11: "011 - MANDACARU",
    12: "012 - FARROUPILHA", 13: "013 - H.U.", 14: "014 - MORANGUEIRA",
    15: "015 - GETULIO VARGAS", 16: "016 - PIÇANDU 1", 17: "017 - TUIUTI",
    18: "018 - SOUZA NAVES", 19: "019 - PALMARES", 20: "020 - DUBAI",
    28: "028 - NEY BRAGA", 31: "031 - SARANDI 2", 32: "032 - CIDADE ALTA",
    33: "033 - KAKOGAWA", 35: "035 - MUFFATO", 36: "036 - SARANDI 3 DRIVE",
    37: "037 - SARANDI 4 UPA", 38: "038 - BOM JARDIM", 39: "039 - MARIALVA",
    40: "040 - PARANÁ", 41: "041 - GASTAO VIDIGAL", 42: "042 - MANDAGUARI",
    43: "043 - TERRA BOA", 44: "044 - SARANDI 5 MARANGONI",
    45: "045 - CAMPO MOURÃO", 46: "046 - MARIALVA 2 HAMADA",
    47: "047 - PIÇANDU 2 CANCAO", 48: "048 - TAPEJARA",
    49: "049 - JANDAIA DO SUL", 50: "050 - SOMACO",
    51: "051 - FIM DA PICADA", 52: "052 - MUFFATO 2 JOÃO PAULINO",
    53: "053 - PORTO RICO", 54: "054 - ITAIPU", 55: "055 - LOANDA",
    56: "056 - PARANAVAÍ", 57: "057 - BOLA DE NEVE",
    59: "059 - NILO RIBEIRO", 60: "060 - AV SÃO PAULO"
};

const CORES_LINHA = {
    "RX": "#378ADD",
    "GENERICO": "#1D9E75",
    "LEITE INFANTIL": "#D85A30",
    "VITAMINAS": "#BA7517",
    "SIMILAR": "#7F77DD",
    "FRALDA": "#D4537E",
    "OTC": "#639922",
    "VACINAS": "#E24B4A",
    "OUTROS": "#888780"
};

function classificaLinha(cat) {
    const c = String(cat).toUpperCase();
    if (c.includes('LEITE')) return 'LEITE INFANTIL';
    if (c.includes('FRALDA')) return 'FRALDA';
    if (c.includes('VITAMIN')) return 'VITAMINAS';
    if (c.includes('VACINA')) return 'VACINAS';
    if (c.includes('GENERIC') || c.includes('GENÉRIC')) return 'GENERICO';
    if (/ RX /.test(c) || c.includes('ETICO') || c.includes('ÉTICO')) return 'RX';
    if (c.includes('SIMILAR')) return 'SIMILAR';
    if (/ OTC /.test(c)) return 'OTC';
    return 'OUTROS';
}

function resolveColorSemaforo(val) {
    if (val >= 10) return getComputedStyle(document.body).getPropertyValue('--color-red').trim();
    if (val >= 5) return getComputedStyle(document.body).getPropertyValue('--color-yellow').trim();
    return getComputedStyle(document.body).getPropertyValue('--color-green').trim();
}

function parseStrToNum(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let s = String(val).replace(/R\$/g, '').trim();
    return parseFloat(s) || 0;
}

const fmtBL = Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function drawBarChart(ctxId, labels, data, colors, isHorizontal = true, labelOpt = {}) {
    if (chartsObj[ctxId]) chartsObj[ctxId].destroy();

    let dataset = {
        data: data,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 4
    };

    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#e5e5e5';

    const maxVal = Math.max(...data, 0);
    const paddedMax = maxVal > 0 ? maxVal * 1.15 : undefined;

    chartsObj[ctxId] = new Chart(document.getElementById(ctxId), {
        type: 'bar',
        data: { labels: labels, datasets: [dataset] },
        options: {
            indexAxis: isHorizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    right: isHorizontal ? 25 : 0,
                    top: !isHorizontal ? 15 : 0
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: isHorizontal ? (isDarkTheme ? '#ffffff' : '#1a1a1a') : '#fff',
                    anchor: 'end',
                    align: isHorizontal ? 'end' : 'bottom',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    ...labelOpt
                }
            },
            scales: {
                x: {
                    max: isHorizontal ? paddedMax : undefined,
                    grid: { color: isHorizontal ? gridColor : 'transparent' },
                    ticks: { color: textColor }
                },
                y: {
                    max: !isHorizontal ? paddedMax : undefined,
                    grid: { color: isHorizontal ? 'transparent' : gridColor },
                    ticks: { color: textColor }
                }
            }
        }
    });
}

function drawFinChart(ctxId, labels, dsInfo) {
    if (chartsObj[ctxId]) chartsObj[ctxId].destroy();

    const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : '#e5e5e5';

    chartsObj[ctxId] = new Chart(document.getElementById(ctxId), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: dsInfo
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, color: textColor } },
                datalabels: { display: false }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `R$${v / 1000}k` } }
            }
        }
    });
}

function calcularDashboard(records) {
    let gCupons = new Set();
    let gLojas = new Set();
    let gVend = new Set();

    let sumVendido = 0;
    let sumDesc = 0;
    let sumMargem = 0;
    let sumPctDesc = 0;
    let countPct = 0;

    let pLoja = {};
    let pVend = {};
    let pCat = {};
    let pLinha = {};

    let pDia = {};
    let datasDiaUnico = {};
    let financeiroLoja = {};

    records.forEach(r => {
        let nr = r.NrCupom;
        if (nr) gCupons.add(nr);

        let codF = parseInt(r.CodFilial);
        let loja = STORE_MAP[codF] ? STORE_MAP[codF] : `Loja ${r.CodFilial}`;
        gLojas.add(loja);

        let vend = r.NmVendedor || 'N/A';
        gVend.add(vend);

        let cat = r.NmCategoria || 'N/A';
        let linha = classificaLinha(cat);

        let dia = null;
        let fData = null;
        if (r.DataVenda) {
            let strDate = String(r.DataVenda).trim().split(' ')[0];
            let parts = strDate.split('/');
            let d;
            if (parts.length === 3) d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            else {
                parts = strDate.split('-');
                if (parts.length === 3) d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
            if (d && !isNaN(d.getTime())) {
                const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
                dia = diasSemana[d.getDay()];
                fData = d.toISOString().split('T')[0];
            }
        }

        if (nr) {
            if (!pLoja[loja]) pLoja[loja] = new Set();
            pLoja[loja].add(nr);

            if (!pVend[vend]) pVend[vend] = new Set();
            pVend[vend].add(nr);

            if (!pCat[cat]) pCat[cat] = new Set();
            pCat[cat].add(nr);

            if (!pLinha[linha]) pLinha[linha] = new Set();
            pLinha[linha].add(nr);
        }

        if (dia) {
            if (!pDia[dia]) pDia[dia] = new Set();
            pDia[dia].add(nr);
            if (!datasDiaUnico[dia]) datasDiaUnico[dia] = new Set();
            datasDiaUnico[dia].add(fData);
        }

        let vVenda = parseStrToNum(r.VlrVenda);
        let vDesc = parseStrToNum(r.VlrDescItens);
        let vMargem = parseStrToNum(r.VlrMargemBruta);
        let vPct = parseStrToNum(r['%DescontoFinal']);

        if (!financeiroLoja[loja]) financeiroLoja[loja] = { v: 0, d: 0, m: 0 };
        financeiroLoja[loja].v += vVenda;
        financeiroLoja[loja].d += vDesc;
        financeiroLoja[loja].m += vMargem;

        sumVendido += vVenda;
        sumDesc += vDesc;
        sumMargem += vMargem;

        if (vPct > 0 || r['%DescontoFinal'] != undefined) {
            sumPctDesc += vPct;
            countPct++;
        }
    });

    const totC = gCupons.size;
    const mediaPct = countPct ? (sumPctDesc / countPct) : 0;

    document.getElementById('kpi-cupons').innerText = totC;
    document.getElementById('kpi-lojas-vend').innerText = `${gLojas.size} / ${gVend.size}`;
    document.getElementById('kpi-vendido').innerText = fmtBL.format(sumVendido);
    document.getElementById('kpi-desconto').innerText = fmtBL.format(sumDesc);
    document.getElementById('kpi-margem').innerText = fmtBL.format(sumMargem);
    document.getElementById('kpi-pct-desc').innerText = `${mediaPct.toFixed(1)}% Médio`;

    const sortArr = (obj) => Object.entries(obj).map(([k, v]) => ({ nome: k, q: v.size })).sort((a, b) => b.q - a.q);

    const arrLojas = sortArr(pLoja);
    const arrVend = sortArr(pVend);
    const arrCats = sortArr(pCat);

    const alertBox = document.getElementById('alert-container');
    alertBox.innerHTML = '';
    const concentradas = arrLojas.filter(l => (l.q / totC) > 0.10);
    concentradas.forEach(l => {
        let pct = ((l.q / totC) * 100).toFixed(1);
        alertBox.innerHTML += `<div class="alert"><strong>Loja ${l.nome}</strong> está concentrando ${pct}% (${l.q}) de todos os cupons da rede!</div>`;
    });

    const topLojas = arrLojas.slice(0, 15);
    drawBarChart('chartLojas', topLojas.map(t => t.nome), topLojas.map(t => t.q), topLojas.map(t => resolveColorSemaforo(t.q)));

    const topVends = arrVend.slice(0, 10);
    drawBarChart('chartVend', topVends.map(t => t.nome), topVends.map(t => t.q), topVends.map(t => resolveColorSemaforo(t.q)));

    const topCats = arrCats.slice(0, 12);
    drawBarChart('chartCat',
        topCats.map(t => t.nome.substring(0, 20)), topCats.map(t => t.q), topCats.map(t => '#0078d4'),
        true, { color: isDarkTheme ? '#ffffff' : '#1a1a1a' }
    );

    let arrLinha = sortArr(pLinha);
    drawBarChart('chartLinhas',
        arrLinha.map(t => t.nome),
        arrLinha.map(t => t.q),
        arrLinha.map(t => CORES_LINHA[t.nome] || CORES_LINHA["OUTROS"])
    );

    const orderDias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    let diaData = orderDias.map(d => {
        if (!pDia[d]) return { n: d, v: 0 };
        return { n: d, v: (pDia[d].size / (datasDiaUnico[d].size || 1)) };
    }).filter(d => d.v > 0);

    let maxDia = Math.max(...diaData.map(d => d.v));
    drawBarChart('chartDias', diaData.map(d => d.n), diaData.map(d => parseFloat(d.v.toFixed(1))),
        diaData.map(d => d.v === maxDia ? '#ff6b6b' : '#0078d4'), false, { color: '#fff', align: 'start' }
    );

    let top8LojasNomes = arrLojas.slice(0, 8).map(l => l.nome);
    let dsFin = [
        { label: 'Vendido Bruto (R$)', backgroundColor: '#378ADD', data: top8LojasNomes.map(n => financeiroLoja[n].v) },
        { label: 'Margem (R$)', backgroundColor: '#1D9E75', data: top8LojasNomes.map(n => financeiroLoja[n].m) },
        { label: 'Desconto (R$)', backgroundColor: '#D85A30', data: top8LojasNomes.map(n => financeiroLoja[n].d) }
    ];
    let compactLabels = top8LojasNomes.map(l => l.includes('-') ? l.split('-')[1].substring(0, 10) : l.substring(0, 10));
    drawFinChart('chartFin', compactLabels, dsFin);

    GLOBAL_EXPORT_DATA = { arrLojas, arrVend, arrCats, arrLinha, diaData, financeiroLoja };

    gerarResumoExecutivoTexto(records, GLOBAL_EXPORT_DATA);
}

function gerarResumoExecutivoTexto(records, exportData) {
    const { arrLojas, arrVend, arrCats, arrLinha, diaData, financeiroLoja } = exportData;
    const totC = arrLojas.reduce((a, b) => a + b.q, 0);

    if (!totC) return;

    const topLoja = arrLojas[0] || { nome: 'N/A', q: 0 };
    const pctTopLoja = ((topLoja.q / totC) * 100).toFixed(1);

    const lojasConcentradas = arrLojas.filter(l => (l.q / totC) > 0.10);
    const mediaCuponsLoja = arrLojas.length ? (totC / arrLojas.length) : 0;
    const lojasAcimaMedia = arrLojas.filter(l => l.q > mediaCuponsLoja * 1.25);

    const topVend = arrVend[0] || { nome: 'N/A', q: 0 };
    const pctTopVend = ((topVend.q / totC) * 100).toFixed(1);
    const mediaCuponsVend = arrVend.length ? (totC / arrVend.length) : 0;
    const vendsAcimaMedia = arrVend.filter(v => v.q > mediaCuponsVend * 1.25);

    const topLinha = arrLinha[0] || { nome: 'N/A', q: 0 };
    const pctTopLinha = ((topLinha.q / totC) * 100).toFixed(1);

    let diaCritico = { n: 'N/A', v: 0 };
    diaData.forEach(d => {
        if (d.v > diaCritico.v) diaCritico = d;
    });

    const totVendidoStr = document.getElementById('kpi-vendido').innerText;
    const totDescStr = document.getElementById('kpi-desconto').innerText;
    const pctDescStr = document.getElementById('kpi-pct-desc').innerText;

    const textoFormatado = `*RESUMO EXECUTIVO - ANÁLISE DE CUPONS E DESCONTOS*
--------------------------------------------------
📊 *VISÃO GERAL DO PERÍODO*:
- Total de Cupons Emitidos: ${totC.toLocaleString('pt-BR')} cupons
- Faturamento Vendido Bruto: ${totVendidoStr}
- Total Concedido em Descontos: ${totDescStr} (${pctDescStr})

🏬 *GARGALOS POR LOJA (Menos cupons = Melhor)*:
- Loja líder em concessões: *${topLoja.nome}* com ${topLoja.q.toLocaleString('pt-BR')} cupons (${pctTopLoja}% do total da rede).
- ${lojasConcentradas.length > 0 ? `Lojas concentrando mais de 10% da rede: ${lojasConcentradas.map(l => l.nome).join(', ')}.` : 'Nenhuma loja ultrapassou 10% isoladamente.'}
- Lojas em nível de Alerta (acima da média): ${lojasAcimaMedia.length} de ${arrLojas.length} unidades.

👤 *GARGALOS POR VENDEDOR*:
- Vendedor líder de cupons: *${topVend.nome}* com ${topVend.q.toLocaleString('pt-BR')} cupons (${pctTopVend}% do total).
- Vendedores em Alerta (acima da média): ${vendsAcimaMedia.length} vendedores.

💊 *PRODUTOS & LINHAS IMPACTADAS*:
- Linha mais afetada: *${topLinha.nome}* com ${topLinha.q.toLocaleString('pt-BR')} cupons (${pctTopLinha}% da rede).

📅 *PICO SEMANAL*:
- Dia com maior ocorrência média/dia: *${diaCritico.n}* (média de ${diaCritico.v.toFixed(1)} cupons/dia).

💡 *DIRETRIZ & RECOMENDAÇÃO GERENCIAL*:
Priorizar auditoria operacional focada na unidade *${topLoja.nome}* e acompanhar o histórico do vendedor *${topVend.nome}*, que lideram os indicadores de exceções manuais.`;

    const container = document.getElementById('summary-content');
    container.innerHTML = `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-item-header">📊 Visão Geral</div>
                <div class="summary-item-text">
                    Foram identificados <strong>${totC.toLocaleString('pt-BR')} cupons únicos</strong> na rede, gerando <strong>${totDescStr}</strong> em descontos (${pctDescStr}) sobre o faturamento bruto de <strong>${totVendidoStr}</strong>.
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-item-header">🏬 Principal Gargalo por Loja</div>
                <div class="summary-item-text">
                    A unidade <strong class="summary-item-highlight">${topLoja.nome}</strong> lidera a emissão com <strong>${topLoja.q.toLocaleString('pt-BR')} cupons</strong> (${pctTopLoja}% da rede). Há <strong>${lojasAcimaMedia.length} lojas</strong> operando acima da média.
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-item-header">👤 Principal Gargalo por Vendedor</div>
                <div class="summary-item-text">
                    O vendedor <strong class="summary-item-highlight">${topVend.nome}</strong> registrou o maior volume com <strong>${topVend.q.toLocaleString('pt-BR')} cupons</strong> (${pctTopVend}% do total). Há <strong>${vendsAcimaMedia.length} vendedores</strong> em alerta.
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-item-header">💊 Linha & Dia Crítico</div>
                <div class="summary-item-text">
                    Linha mais afetada: <strong>${topLinha.nome}</strong> (${pctTopLinha}% dos cupons). O dia de maior incidência é <strong>${diaCritico.n}</strong> (média de ${diaCritico.v.toFixed(1)} cupons/dia).
                </div>
            </div>
        </div>

        <div class="summary-exec-box">
            <div class="summary-exec-title">🎯 Parecer Executivo & Recomendação</div>
            <div class="summary-exec-desc">
                Conforme a metodologia de gestão (menor emissão = melhor desempenho), recomenda-se direcionar a auditoria operacional prioritariamente na unidade <strong>${topLoja.nome}</strong> e revisar os limites de concessão do vendedor <strong>${topVend.nome}</strong>.
            </div>
        </div>
    `;

    window.SUMMARY_TEXT_RAW = textoFormatado;
}

document.getElementById('btn-copy-summary').addEventListener('click', () => {
    if (!window.SUMMARY_TEXT_RAW) return;
    navigator.clipboard.writeText(window.SUMMARY_TEXT_RAW).then(() => {
        const btn = document.getElementById('btn-copy-summary');
        const origText = btn.innerHTML;
        btn.innerHTML = '<span>✅</span> Copiado com Sucesso!';
        btn.style.background = 'var(--color-green)';
        setTimeout(() => {
            btn.innerHTML = origText;
            btn.style.background = '';
        }, 2500);
    });
});
