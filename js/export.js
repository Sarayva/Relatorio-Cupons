// ==========================================
// MÓDULO JS: EXPORTAÇÃO EXCEL (EXCELJS)
// ==========================================

function obterIdentificadorSemana(records) {
    if (!records || !records.length) return 'atual';

    let datasValidas = [];
    for (let r of records) {
        if (r.DataVenda) {
            let strDate = String(r.DataVenda).trim().split(' ')[0];
            let parts = strDate.split('/');
            if (parts.length === 3) {
                let d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                if (!isNaN(d.getTime())) datasValidas.push(d);
            } else {
                parts = strDate.split('-');
                if (parts.length === 3) {
                    let d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    if (!isNaN(d.getTime())) datasValidas.push(d);
                }
            }
        }
    }

    if (datasValidas.length > 0) {
        datasValidas.sort((a, b) => a - b);
        let minDate = datasValidas[0];
        let maxDate = datasValidas[datasValidas.length - 1];

        const fmtDDMM = (d) => {
            let day = String(d.getDate()).padStart(2, '0');
            let month = String(d.getMonth() + 1).padStart(2, '0');
            return `${day}-${month}`;
        };

        let minStr = fmtDDMM(minDate);
        let maxStr = fmtDDMM(maxDate);

        if (minStr === maxStr) return minStr;
        return `${minStr} a ${maxStr}`;
    }

    return 'atual';
}

async function exportarExcelProfissional() {
    if (!GLOBAL_RECORDS.length) return;

    const btnExport = document.getElementById('btn-export');
    const origText = btnExport.innerHTML;
    btnExport.disabled = true;
    btnExport.innerHTML = '⏳ Gerando Excel Profissional...';

    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'FarmaPaulo - Análise de Cupons';
        workbook.lastModifiedBy = 'FarmaPaulo';
        workbook.created = new Date();

        const { arrLojas, arrVend, arrCats, arrLinha, diaData, financeiroLoja } = GLOBAL_EXPORT_DATA;
        const totCupons = arrLojas.reduce((a, b) => a + b.q, 0);

        const HEADER_BG = 'FFC0392B';
        const HEADER_FONT = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        const TITLE_FONT = { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
        const SUBTITLE_FONT = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF566573' } };
        const THIN_BORDER = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        const formatHeaderRow = (row, height = 28) => {
            row.height = height;
            row.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
                cell.font = HEADER_FONT;
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFA6ACAF' } },
                    left: { style: 'thin', color: { argb: 'FFA6ACAF' } },
                    bottom: { style: 'medium', color: { argb: 'FF922B21' } },
                    right: { style: 'thin', color: { argb: 'FFA6ACAF' } }
                };
            });
        };

        const applyZebraAndBorders = (sheet, startRow = 2) => {
            sheet.eachRow((row, rowNum) => {
                if (rowNum < startRow) return;
                const isEven = rowNum % 2 === 0;
                const bgColor = isEven ? 'FFFFFFFF' : 'FFF9F9FB';
                row.eachCell((cell) => {
                    if (!cell.fill || !cell.fill.fgColor) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                    }
                    cell.border = THIN_BORDER;
                    if (!cell.font || !cell.font.bold) {
                        cell.font = { name: 'Segoe UI', size: 10 };
                    }
                });
            });
        };

        const autoFitColumns = (sheet) => {
            sheet.columns.forEach(column => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, cell => {
                    let val = cell.value;
                    if (val !== null && val !== undefined) {
                        let str = typeof val === 'object' ? (val.result || JSON.stringify(val)) : String(val);
                        if (str.length > maxLength) maxLength = str.length;
                    }
                });
                column.width = Math.max(maxLength + 5, 14);
            });
        };

        let minDate = '', maxDate = '';
        const datas = GLOBAL_RECORDS.map(r => String(r.DataVenda || '')).filter(d => d.length >= 8).sort();
        if (datas.length) {
            minDate = datas[0].split(' ')[0];
            maxDate = datas[datas.length - 1].split(' ')[0];
        }

        // 1. ABA RESUMO EXECUTIVO
        const wsResumo = workbook.addWorksheet('Resumo Executivo', { views: [{ showGridLines: true }] });
        wsResumo.mergeCells('A1:E1');
        const titleCell = wsResumo.getCell('A1');
        titleCell.value = 'RELATÓRIO EXECUTIVO - ANÁLISE DE CUPONS E DESCONTOS';
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
        titleCell.font = TITLE_FONT;
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        wsResumo.getRow(1).height = 40;

        wsResumo.mergeCells('A2:E2');
        const subCell = wsResumo.getCell('A2');
        subCell.value = 'Farmácias São Paulo | Controle Gerencial de Descontos e Exceções Operacionais';
        subCell.font = SUBTITLE_FONT;
        subCell.alignment = { vertical: 'middle', horizontal: 'center' };
        wsResumo.getRow(2).height = 22;

        const sumVendidoStr = document.getElementById('kpi-vendido')?.innerText || 'R$ 0';
        const sumDescStr = document.getElementById('kpi-desconto')?.innerText || 'R$ 0';
        const sumMargemStr = document.getElementById('kpi-margem')?.innerText || 'R$ 0';

        const kpis = [
            ['Data de Emissão do Relatório', new Date().toLocaleDateString('pt-BR')],
            ['Período das Vendas Analisadas', minDate && maxDate ? `${minDate} até ${maxDate}` : 'Período Completo'],
            ['Total de Cupons Únicos Emitidos', totCupons],
            ['Total Vendido Bruto', sumVendidoStr],
            ['Total Concedido em Descontos', sumDescStr],
            ['Margem Bruta Consolidada', sumMargemStr],
            ['Lojas Ativas com Emissão', arrLojas.length],
            ['Vendedores com Concessão de Descontos', arrVend.length]
        ];

        let currRow = 4;
        kpis.forEach(([label, val]) => {
            const r = wsResumo.getRow(currRow);
            r.getCell(1).value = label;
            r.getCell(2).value = val;
            r.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true };
            r.getCell(2).font = { name: 'Segoe UI', size: 10 };
            if (typeof val === 'number') r.getCell(2).numFmt = '#,##0';
            currRow++;
        });

        applyZebraAndBorders(wsResumo, 4);
        autoFitColumns(wsResumo);

        // 2. ABA POR LOJA
        const wsLojas = workbook.addWorksheet('Por Loja', { views: [{ state: 'frozen', ySplit: 1 }] });
        const hLojas = wsLojas.addRow(['Posição', 'Loja / Unidade', 'Qtd. Cupons', '% do Total na Rede', 'Status Operacional']);
        formatHeaderRow(hLojas);

        const mediaLoja = totCupons / (arrLojas.length || 1);
        arrLojas.forEach((l, idx) => {
            const pct = totCupons > 0 ? (l.q / totCupons) : 0;
            let statusText = 'Normal';
            let statusBg = 'FFD5F5E3';
            let statusFg = 'FF1E8449';

            if (pct > 0.10) {
                statusText = 'CRÍTICO (>10%)';
                statusBg = 'FFFADBD8';
                statusFg = 'FFC0392B';
            } else if (l.q > mediaLoja * 1.25) {
                statusText = 'ALERTA (Acima Média)';
                statusBg = 'FFFCE5CD';
                statusFg = 'FFB9770E';
            }

            const row = wsLojas.addRow([idx + 1, l.nome, l.q, pct, statusText]);
            row.getCell(3).numFmt = '#,##0';
            row.getCell(4).numFmt = '0.0%';

            const cellQtd = row.getCell(3);
            const cellStatus = row.getCell(5);

            cellQtd.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
            cellQtd.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };

            cellStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
            cellStatus.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };
            cellStatus.alignment = { horizontal: 'center' };
        });

        applyZebraAndBorders(wsLojas, 2);
        autoFitColumns(wsLojas);

        // 3. ABA POR VENDEDOR
        const wsVend = workbook.addWorksheet('Por Vendedor', { views: [{ state: 'frozen', ySplit: 1 }] });
        const hVend = wsVend.addRow(['Posição', 'Vendedor', 'Qtd. Cupons', '% do Total', 'Status de Desempenho']);
        formatHeaderRow(hVend);

        const mediaVend = totCupons / (arrVend.length || 1);
        arrVend.forEach((v, idx) => {
            const pct = totCupons > 0 ? (v.q / totCupons) : 0;
            let statusText = 'Normal';
            let statusBg = 'FFD5F5E3';
            let statusFg = 'FF1E8449';

            if (v.q > mediaVend * 1.5) {
                statusText = 'ALERTA (Muito Acima Média)';
                statusBg = 'FFFADBD8';
                statusFg = 'FFC0392B';
            } else if (v.q > mediaVend * 1.1) {
                statusText = 'Atenção';
                statusBg = 'FFFCE5CD';
                statusFg = 'FFB9770E';
            }

            const row = wsVend.addRow([idx + 1, v.nome, v.q, pct, statusText]);
            row.getCell(3).numFmt = '#,##0';
            row.getCell(4).numFmt = '0.0%';

            const cellQtd = row.getCell(3);
            const cellStatus = row.getCell(5);

            cellQtd.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
            cellQtd.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };

            cellStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
            cellStatus.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };
            cellStatus.alignment = { horizontal: 'center' };
        });

        applyZebraAndBorders(wsVend, 2);
        autoFitColumns(wsVend);

        // 4. ABA POR LINHA DE MEDICAMENTO
        const wsTipo = workbook.addWorksheet('Por Linha de Medicamento', { views: [{ state: 'frozen', ySplit: 1 }] });
        const hTipo = wsTipo.addRow(['Posição', 'Linha de Medicamento', 'Qtd. Cupons', '% do Total']);
        formatHeaderRow(hTipo);

        arrLinha.forEach((l, idx) => {
            const pct = totCupons > 0 ? (l.q / totCupons) : 0;
            const row = wsTipo.addRow([idx + 1, l.nome, l.q, pct]);
            row.getCell(3).numFmt = '#,##0';
            row.getCell(4).numFmt = '0.0%';
        });

        applyZebraAndBorders(wsTipo, 2);
        autoFitColumns(wsTipo);

        // 5. ABA POR DIA DA SEMANA
        const wsDia = workbook.addWorksheet('Por Dia da Semana', { views: [{ state: 'frozen', ySplit: 1 }] });
        const hDia = wsDia.addRow(['Dia da Semana', 'Média de Cupons / Dia', '% do Total']);
        formatHeaderRow(hDia);

        const sumMediaDia = diaData.reduce((a, b) => a + b.v, 0);

        diaData.forEach((d) => {
            const pct = sumMediaDia > 0 ? (d.v / sumMediaDia) : 0;
            const row = wsDia.addRow([d.n, d.v, pct]);
            row.getCell(2).numFmt = '#,##0.0';
            row.getCell(3).numFmt = '0.0%';
        });

        applyZebraAndBorders(wsDia, 2);
        autoFitColumns(wsDia);

        // 6. ABA COMPARATIVO COMPLETO (LOJAS, VENDEDORES E LINHAS)
        const listaSemanasExp = Object.keys(GLOBAL_SEMANAS_MAP);
        if (listaSemanasExp.length > 1) {
            const wsComp = workbook.addWorksheet('Comparativo Completo', { views: [{ showGridLines: true }] });
            const semA = (typeof GLOBAL_SELECTED_BASE_WEEKS !== 'undefined' && GLOBAL_SELECTED_BASE_WEEKS.length) ? GLOBAL_SELECTED_BASE_WEEKS : listaSemanasExp[0];
            const semB = (typeof GLOBAL_SELECTED_TARGET_WEEKS !== 'undefined' && GLOBAL_SELECTED_TARGET_WEEKS.length) ? GLOBAL_SELECTED_TARGET_WEEKS : listaSemanasExp[listaSemanasExp.length - 1];
            const compRes = calcularComparativoSemanal(GLOBAL_SEMANAS_MAP, semA, semB);

            if (compRes) {
                const semALabel = compRes.semanaBase;
                const semBLabel = compRes.semanaComparada;

                // TÍTULO DO COMPARATIVO
                wsComp.mergeCells('A1:E1');
                const tCompCell = wsComp.getCell('A1');
                tCompCell.value = `COMPARATIVO ANÁLITICO: ${semALabel} vs ${semBLabel}`;
                tCompCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
                tCompCell.font = TITLE_FONT;
                tCompCell.alignment = { vertical: 'middle', horizontal: 'center' };
                wsComp.getRow(1).height = 36;

                // SEÇÃO 1: COMPARATIVO POR LOJA
                let rIdx = 3;
                const rHLoja = wsComp.getRow(rIdx);
                rHLoja.getCell(1).value = 'TABELA COMPARATIVA POR LOJA / UNIDADE';
                rHLoja.getCell(1).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFC0392B' } };
                rIdx++;

                const hCompLojas = wsComp.getRow(rIdx);
                hCompLojas.values = ['Loja / Unidade', `Cupons (${semALabel})`, `Cupons (${semBLabel})`, 'Variação (Δ%)', 'Status de Desempenho'];
                formatHeaderRow(hCompLojas);
                rIdx++;

                compRes.lojas.forEach(l => {
                    let statusBg = l.deltaNum > 0 ? 'FFFADBD8' : l.deltaNum < 0 ? 'FFD5F5E3' : 'FFFCE5CD';
                    let statusFg = l.deltaNum > 0 ? 'FFC0392B' : l.deltaNum < 0 ? 'FF1E8449' : 'FFB9770E';

                    const row = wsComp.getRow(rIdx);
                    row.values = [l.loja, l.cA, l.cB, l.deltaNum / 100, l.statusLabel];
                    row.getCell(2).numFmt = '#,##0';
                    row.getCell(3).numFmt = '#,##0';
                    row.getCell(4).numFmt = '+0.0%;-0.0%;0.0%';

                    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
                    row.getCell(4).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };

                    row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
                    row.getCell(5).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };
                    row.getCell(5).alignment = { horizontal: 'center' };
                    rIdx++;
                });

                rIdx += 2;

                // SEÇÃO 2: COMPARATIVO POR VENDEDOR
                const rHVend = wsComp.getRow(rIdx);
                rHVend.getCell(1).value = 'TABELA COMPARATIVA POR VENDEDOR';
                rHVend.getCell(1).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFC0392B' } };
                rIdx++;

                const hCompVend = wsComp.getRow(rIdx);
                hCompVend.values = ['Vendedor', `Cupons (${semALabel})`, `Cupons (${semBLabel})`, 'Variação (Δ%)', 'Status de Desempenho'];
                formatHeaderRow(hCompVend);
                rIdx++;

                compRes.vendedores.slice(0, 15).forEach(v => {
                    let statusBg = v.deltaNum > 0 ? 'FFFADBD8' : v.deltaNum < 0 ? 'FFD5F5E3' : 'FFFCE5CD';
                    let statusFg = v.deltaNum > 0 ? 'FFC0392B' : v.deltaNum < 0 ? 'FF1E8449' : 'FFB9770E';

                    const row = wsComp.getRow(rIdx);
                    row.values = [v.vend, v.cA, v.cB, v.deltaNum / 100, v.statusLabel];
                    row.getCell(2).numFmt = '#,##0';
                    row.getCell(3).numFmt = '#,##0';
                    row.getCell(4).numFmt = '+0.0%;-0.0%;0.0%';

                    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
                    row.getCell(4).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };

                    row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
                    row.getCell(5).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };
                    row.getCell(5).alignment = { horizontal: 'center' };
                    rIdx++;
                });

                rIdx += 2;

                // SEÇÃO 3: COMPARATIVO POR LINHA DE MEDICAMENTO
                const rHLinha = wsComp.getRow(rIdx);
                rHLinha.getCell(1).value = 'TABELA COMPARATIVA POR LINHA DE MEDICAMENTO';
                rHLinha.getCell(1).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFC0392B' } };
                rIdx++;

                const hCompLinha = wsComp.getRow(rIdx);
                hCompLinha.values = ['Linha de Medicamento', `Cupons (${semALabel})`, `Cupons (${semBLabel})`, 'Variação (Δ%)', 'Status de Desempenho'];
                formatHeaderRow(hCompLinha);
                rIdx++;

                compRes.linhas.forEach(ln => {
                    let statusBg = ln.deltaNum > 0 ? 'FFFADBD8' : ln.deltaNum < 0 ? 'FFD5F5E3' : 'FFFCE5CD';
                    let statusFg = ln.deltaNum > 0 ? 'FFC0392B' : ln.deltaNum < 0 ? 'FF1E8449' : 'FFB9770E';

                    const row = wsComp.getRow(rIdx);
                    row.values = [ln.linha, ln.cA, ln.cB, ln.deltaNum / 100, ln.statusLabel];
                    row.getCell(2).numFmt = '#,##0';
                    row.getCell(3).numFmt = '#,##0';
                    row.getCell(4).numFmt = '+0.0%;-0.0%;0.0%';

                    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
                    row.getCell(4).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };

                    row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
                    row.getCell(5).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusFg } };
                    row.getCell(5).alignment = { horizontal: 'center' };
                    rIdx++;
                });

                applyZebraAndBorders(wsComp, 4);
                autoFitColumns(wsComp);
            }
        }

        // 7. ABA GRÁFICOS
        const wsGraficos = workbook.addWorksheet('Gráficos', { views: [{ showGridLines: true }] });

        const getExportableChartImage = (canvas) => {
            if (!canvas) return null;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');

            ctx.fillStyle = isDarkTheme ? '#181818' : '#ffffff';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            return tempCanvas.toDataURL('image/png');
        };

        const chartPairs = [
            [
                { id: 'chartLojas', title: '1. Ranking de Cupons por Loja' },
                { id: 'chartVend', title: '2. Top Vendedores com Mais Cupons' }
            ],
            [
                { id: 'chartCat', title: '3. Distribuição por Categoria de Produto' },
                { id: 'chartLinhas', title: '4. Distribuição por Linha de Medicamentos' }
            ],
            [
                { id: 'chartDias', title: '5. Média de Cupons por Dia da Semana' },
                { id: 'chartFin', title: '6. Análise Financeira: Vendido vs Margem vs Desconto' }
            ]
        ];

        let startRow = 1;

        for (const pair of chartPairs) {
            const leftChart = pair[0];
            const rightChart = pair[1];

            if (leftChart) {
                const cellL = wsGraficos.getCell(`A${startRow}`);
                cellL.value = leftChart.title;
                cellL.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF000000' } };

                const canvasL = document.getElementById(leftChart.id);
                if (canvasL) {
                    const imgDataL = getExportableChartImage(canvasL);
                    const imageIdL = workbook.addImage({ base64: imgDataL, extension: 'png' });
                    wsGraficos.addImage(imageIdL, {
                        tl: { col: 0, row: startRow },
                        ext: { width: 590, height: 320 }
                    });
                }
            }

            if (rightChart) {
                const cellR = wsGraficos.getCell(`O${startRow}`);
                cellR.value = rightChart.title;
                cellR.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF000000' } };

                const canvasR = document.getElementById(rightChart.id);
                if (canvasR) {
                    const imgDataR = getExportableChartImage(canvasR);
                    const imageIdR = workbook.addImage({ base64: imgDataR, extension: 'png' });
                    wsGraficos.addImage(imageIdR, {
                        tl: { col: 14, row: startRow },
                        ext: { width: 590, height: 320 }
                    });
                }
            }

            wsGraficos.getRow(startRow).height = 20;
            startRow += 19;
        }

        const semanaId = obterIdentificadorSemana(GLOBAL_RECORDS);
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio semana ${semanaId}.xlsx`;
        link.click();
        URL.revokeObjectURL(link.href);

    } catch (err) {
        console.error('Erro ao gerar Excel profissional:', err);
        alert('Ocorreu um erro ao gerar o relatório Excel: ' + err.message);
    } finally {
        btnExport.disabled = false;
        btnExport.innerHTML = origText;
    }
}
