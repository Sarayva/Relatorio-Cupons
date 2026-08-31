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

function getFieldValue(r, fieldType) {
    if (!r) return '';

    if (fieldType === 'categoria') {
        const exactKeys = ['NmCategoria', 'NMCATEGORIA', 'Categoria', 'CATEGORIA', 'DescrCategoria', 'DESCR_CATEGORIA', 'Nome Categoria', 'NomeCategoria', 'Desc Categoria', 'DescCategoria', 'DESCRICAO_CATEGORIA', 'Descrição Categoria', 'DESCRIP_CATEGORIA', 'GRUPO', 'Grupo', 'SUB_CATEGORIA', 'Subcategoria', 'Seção', 'Secao', 'DEPARTAMENTO', 'Departamento'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return String(r[k]).trim();
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if ((kUpper.includes('CATEGOR') || kUpper.includes('GRUPO')) && !kUpper.includes('DESC') && r[k] && String(r[k]).trim() !== '') {
                return String(r[k]).trim();
            }
        }
        return 'N/A';
    }

    if (fieldType === 'vendedor') {
        const exactKeys = ['NmVendedor', 'NMVENDEDOR', 'Vendedor', 'VENDEDOR', 'NomeVendedor', 'Nome Vendedor', 'CodVendedor', 'CODVENDEDOR'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return String(r[k]).trim();
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if (kUpper.includes('VENDEDOR') && r[k] && String(r[k]).trim() !== '') return String(r[k]).trim();
        }
        return 'N/A';
    }

    if (fieldType === 'loja') {
        const exactKeys = ['CodFilial', 'CODFILIAL', 'Filial', 'FILIAL', 'Loja', 'LOJA', 'CodLoja', 'CODLOJA', 'Unidade'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if ((kUpper.includes('FILIAL') || kUpper.includes('LOJA')) && r[k]) return r[k];
        }
        return 0;
    }

    if (fieldType === 'cupom') {
        const exactKeys = ['NrCupom', 'NRCUPOM', 'Cupom', 'CUPOM', 'NumCupom', 'Número Cupom', 'NumeroCupom', 'COD_CUPOM', 'NRO_CUPOM'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return String(r[k]).trim();
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if (kUpper.includes('CUPOM') && r[k] && String(r[k]).trim() !== '') return String(r[k]).trim();
        }
        return null;
    }

    if (fieldType === 'data') {
        const exactKeys = ['DataVenda', 'DATAVENDA', 'Data', 'DATA', 'DataEmissao', 'Data Venda', 'DATA_VENDA'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if (kUpper.includes('DATA') && r[k]) return r[k];
        }
        return null;
    }

    if (fieldType === 'venda') {
        const exactKeys = ['VlrVenda', 'VLRVENDA', 'Venda', 'VENDA', 'ValorVenda', 'Valor Venda', 'TotalVenda', 'VLR_VENDA'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if (kUpper.includes('VENDA') && r[k]) return r[k];
        }
        return 0;
    }

    if (fieldType === 'desconto') {
        const exactKeys = ['VlrDescItens', 'VLRDESCITENS', 'Desconto', 'DESCONTO', 'ValorDesconto', 'Valor Desconto', 'VlrDesconto', 'VLR_DESCONTO'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if (kUpper.includes('DESC') && r[k]) return r[k];
        }
        return 0;
    }

    if (fieldType === 'margem') {
        const exactKeys = ['VlrMargemBruta', 'VLRMARGEMBRUTA', 'Margem', 'MARGEM', 'ValorMargem', 'Valor Margem', 'MargemBruta', 'MARGEM_BRUTA'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if (kUpper.includes('MARGEM') && r[k]) return r[k];
        }
        return 0;
    }

    if (fieldType === 'pct') {
        const exactKeys = ['%DescontoFinal', '%DESCONTOFINAL', '%Desconto', '% Desconto', 'PctDesconto', 'PERC_DESCONTO'];
        for (let k of exactKeys) {
            if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
        }
        for (let k in r) {
            let kUpper = k.toUpperCase();
            if (kUpper.includes('%') && r[k]) return r[k];
        }
        return 0;
    }

    return r[fieldType];
}

function classificaLinha(cat) {
    const c = String(cat || '').toUpperCase();
    if (c.includes('LEITE')) return 'LEITE INFANTIL';
    if (c.includes('FRALDA')) return 'FRALDA';
    if (c.includes('VITAMIN')) return 'VITAMINAS';
    if (c.includes('VACINA')) return 'VACINAS';
    if (c.includes('GENERIC') || c.includes('GENÉRIC')) return 'GENERICO';
    if (/ RX /.test(c) || c.includes('ETICO') || c.includes('ÉTICO') || c.startsWith('RX') || c.endsWith('RX') || c === 'RX') return 'RX';
    if (c.includes('SIMILAR')) return 'SIMILAR';
    if (/ OTC /.test(c) || c.startsWith('OTC') || c.endsWith('OTC') || c === 'OTC') return 'OTC';
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
                    color: isDarkTheme ? '#ffffff' : '#1a1a1a',
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
        let nr = getFieldValue(r, 'cupom');
        if (nr) gCupons.add(nr);

        let codF = parseInt(getFieldValue(r, 'loja'));
        let loja = STORE_MAP[codF] ? STORE_MAP[codF] : `Loja ${codF || r.CodFilial || 'N/A'}`;
        gLojas.add(loja);

        let vend = getFieldValue(r, 'vendedor');
        gVend.add(vend);

        let cat = getFieldValue(r, 'categoria');
        let linha = classificaLinha(cat);

        let dataRaw = getFieldValue(r, 'data');
        let dia = null;
        let fData = null;
        if (dataRaw) {
            let strDate = String(dataRaw).trim().split(' ')[0];
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

        if (!pLoja[loja]) pLoja[loja] = new Set();
        if (nr) pLoja[loja].add(nr);

        if (!pVend[vend]) pVend[vend] = new Set();
        if (nr) pVend[vend].add(nr);

        if (!pCat[cat]) pCat[cat] = new Set();
        if (nr) pCat[cat].add(nr);

        if (!pLinha[linha]) pLinha[linha] = new Set();
        if (nr) pLinha[linha].add(nr);

        if (dia && fData) {
            if (!pDia[dia]) pDia[dia] = { cupons: new Set(), datas: new Set() };
            if (nr) pDia[dia].cupons.add(nr);
            pDia[dia].datas.add(fData);
        }

        let vVenda = parseStrToNum(getFieldValue(r, 'venda'));
        let vDesc = parseStrToNum(getFieldValue(r, 'desconto'));
        let vMargem = parseStrToNum(getFieldValue(r, 'margem'));
        let vPct = parseStrToNum(getFieldValue(r, 'pct'));

        if (!isNaN(vVenda)) sumVendido += vVenda;
        if (!isNaN(vDesc)) sumDesc += vDesc;
        if (!isNaN(vMargem)) sumMargem += vMargem;

        if (vPct > 0 || getFieldValue(r, 'pct') != undefined) {
            sumPctDesc += vPct;
            countPct++;
        }

        if (!financeiroLoja[loja]) {
            financeiroLoja[loja] = { cupons: new Set(), venda: 0, desc: 0, margem: 0 };
        }
        if (nr) financeiroLoja[loja].cupons.add(nr);
        if (!isNaN(vVenda)) financeiroLoja[loja].venda += vVenda;
        if (!isNaN(vDesc)) financeiroLoja[loja].desc += vDesc;
        if (!isNaN(vMargem)) financeiroLoja[loja].margem += vMargem;
    });

    document.getElementById('kpi-cupons').innerText = gCupons.size.toLocaleString('pt-BR');
    document.getElementById('kpi-lojas-vend').innerText = `${gLojas.size} / ${gVend.size}`;
    document.getElementById('kpi-vendido').innerText = fmtBL.format(sumVendido);
    document.getElementById('kpi-desconto').innerText = fmtBL.format(sumDesc);
    document.getElementById('kpi-pct-desc').innerText = countPct ? (sumPctDesc / countPct).toFixed(1) + '%' : '0%';
    document.getElementById('kpi-margem').innerText = fmtBL.format(sumMargem);

    const arrLojas = Object.entries(pLoja).map(([nome, set]) => ({ nome, q: set.size })).sort((a, b) => b.q - a.q);
    const arrVend = Object.entries(pVend).map(([nome, set]) => ({ nome, q: set.size })).sort((a, b) => b.q - a.q);
    const arrCats = Object.entries(pCat).map(([nome, set]) => ({ nome, q: set.size })).sort((a, b) => b.q - a.q);
    const arrLinha = Object.entries(pLinha).map(([nome, set]) => ({ nome, q: set.size })).sort((a, b) => b.q - a.q);

    const totCupons = gCupons.size || 1;
    const alertDiv = document.getElementById('alert-container');
    alertDiv.innerHTML = '';

    arrLojas.forEach(l => {
        let pct = (l.q / totCupons) * 100;
        if (pct >= 10) {
            let div = document.createElement('div');
            div.className = 'alert';
            div.innerHTML = `<strong>ALERTA DE CONCENTRAÇÃO:</strong> A loja <strong>${l.nome}</strong> é responsável por <strong>${pct.toFixed(1)}%</strong> do total de cupons da rede (${l.q.toLocaleString('pt-BR')} cupons).`;
            alertDiv.appendChild(div);
        }
    });

    const top8Lojas = arrLojas.slice(0, 8);
    drawBarChart('chartLojas', top8Lojas.map(l => l.nome.replace(/^\d+\s*-\s*/, '')), top8Lojas.map(l => l.q), top8Lojas.map(l => resolveColorSemaforo((l.q / totCupons) * 100)));

    const top8Vend = arrVend.slice(0, 8);
    drawBarChart('chartVend', top8Vend.map(v => v.nome), top8Vend.map(v => v.q), '#378ADD');

    const top6Cats = arrCats.slice(0, 6);
    drawBarChart('chartCat', top6Cats.map(c => c.nome.substring(0, 20)), top6Cats.map(c => c.q), '#0078d4');

    drawBarChart('chartLinhas', arrLinha.map(l => l.nome), arrLinha.map(l => l.q), arrLinha.map(l => CORES_LINHA[l.nome] || '#888780'));

    const ordemDias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const diaData = ordemDias.map(d => {
        let obj = pDia[d];
        let media = 0;
        if (obj && obj.datas.size > 0) media = obj.cupons.size / obj.datas.size;
        return { n: d.replace('-feira', ''), v: media };
    });
    drawBarChart('chartDias', diaData.map(d => d.n), diaData.map(d => d.v), '#0078d4', false, {
        formatter: v => v > 0 ? v.toFixed(1) : ''
    });

    const finLojasTop = top8Lojas.map(l => l.nome);
    const dsVenda = finLojasTop.map(n => (financeiroLoja[n]?.venda || 0));
    const dsMargem = finLojasTop.map(n => (financeiroLoja[n]?.margem || 0));
    const dsDesc = finLojasTop.map(n => (financeiroLoja[n]?.desc || 0));

    drawFinChart('chartFin', finLojasTop.map(n => n.replace(/^\d+\s*-\s*/, '')), [
        { label: 'Vendido', data: dsVenda, backgroundColor: '#378ADD', borderRadius: 4 },
        { label: 'Margem', data: dsMargem, backgroundColor: '#1D9E75', borderRadius: 4 },
        { label: 'Desconto', data: dsDesc, backgroundColor: '#C0392B', borderRadius: 4 }
    ]);

    gerarResumoExecutivo({
        totCupons, sumVendido, sumDesc, sumMargem, countPct, sumPctDesc,
        arrLojas, arrVend, arrLinha, arrCats, diaData, gLojas, gVend
    });

    GLOBAL_EXPORT_DATA = { arrLojas, arrVend, arrCats, arrLinha, diaData, financeiroLoja };
}

function gerarResumoExecutivo(dados) {
    const { totCupons, sumVendido, sumDesc, sumMargem, countPct, sumPctDesc, arrLojas, arrVend, arrLinha, arrCats, diaData, gLojas, gVend } = dados;

    const mediaLojas = totCupons / (gLojas.size || 1);
    const lojasAlerta = arrLojas.filter(l => l.q > mediaLojas * 1.3);

    const mediaVend = totCupons / (gVend.size || 1);
    const vendAlerta = arrVend.filter(v => v.q > mediaVend * 1.5);

    const pctMédioDesc = countPct ? (sumPctDesc / countPct).toFixed(1) : 0;
    const linhaTop = arrLinha.length ? arrLinha[0] : { nome: 'N/A', q: 0 };

    let diaCritico = { n: 'N/A', v: 0 };
    diaData.forEach(d => { if (d.v > diaCritico.v) diaCritico = d; });

    const html = `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-item-header">📊 Volume Geral</div>
                <div class="summary-item-text">
                    Foram emitidos <strong>${totCupons.toLocaleString('pt-BR')} cupons únicos</strong> na rede, gerando <strong>${fmtBL.format(sumVendido)}</strong> em vendas brutas com <strong>${fmtBL.format(sumDesc)}</strong> em descontos (${pctMédioDesc}% médio).
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-item-header">🏢 Concentração por Loja</div>
                <div class="summary-item-text">
                    ${lojasAlerta.length ? `Lojas com alto volume de exceções: <span class="summary-item-highlight">${lojasAlerta.map(l => l.nome).join(', ')}</span> (acima de 30% da média).` : 'Distribuição de cupons entre as lojas está equilibrada.'}
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-item-header">👨‍💼 Vendedores em Destaque</div>
                <div class="summary-item-text">
                    ${vendAlerta.length ? `Vendedores com concessão acima de 50% da média: <span class="summary-item-highlight">${vendAlerta.slice(0, 3).map(v => v.nome).join(', ')}</span>.` : 'Emissão por vendedores mantida dentro dos padrões.'}
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-item-header">💊 Linha Mais Afetada</div>
                <div class="summary-item-text">
                    A linha de produto com maior volume de cupons foi <strong>${linhaTop.nome}</strong> com <strong>${linhaTop.q.toLocaleString('pt-BR')} cupons</strong> (${((linhaTop.q / totCupons) * 100).toFixed(1)}% do total).
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-item-header">📅 Dia Crítico da Semana</div>
                <div class="summary-item-text">
                    O dia da semana com maior média de emissão foi <strong>${diaCritico.n}</strong> com média de <strong>${diaCritico.v.toFixed(1)} cupons/dia</strong>.
                </div>
            </div>
        </div>
        <div class="summary-exec-box">
            <div class="summary-exec-title">💡 Parecer Gerencial FarmaPaulo</div>
            <div class="summary-exec-desc">
                Recomenda-se realizar a auditoria operacional prioritária nas lojas com concentração superior a 10% e revisar as diretrizes de desconto da linha <strong>${linhaTop.nome}</strong> para preservar a margem líquida de <strong>${fmtBL.format(sumMargem)}</strong>.
            </div>
        </div>
    `;

    document.getElementById('summary-content').innerHTML = html;
}
