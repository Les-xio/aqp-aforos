function jsonToCsv(data, columns) {
  const headers = columns.map(c => c.label);
  const rows = data.map(item =>
    columns.map(c => {
      const val = getNestedValue(item, c.key);
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (!acc) return undefined;
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const arr = acc[match[1]];
      return arr && arr[Number(match[2])] !== undefined ? arr[Number(match[2])] : undefined;
    }
    return acc[part] !== undefined ? acc[part] : undefined;
  }, obj);
}

async function sendExport(res, data, columns, filename, format, totals) {
  if (format === 'csv') {
    let csv = jsonToCsv(data, columns);
    if (totals && totals.length > 0) {
      csv += '\n\nTotales por tipo de vehículo\n';
      csv += 'Vehículo,Cantidad\n';
      totals.forEach(t => { csv += `${t.vehiculo},${t.total}\n`; });
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send('\uFEFF' + csv);
  }

  if (format === 'xlsx') {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Datos');
    sheet.columns = columns.map(c => ({ header: c.label, key: c.key, width: c.width || 20 }));
    data.forEach(item => sheet.addRow(
      columns.reduce((acc, c) => { acc[c.key] = getNestedValue(item, c.key) ?? ''; return acc; }, {})
    ));
    sheet.getRow(1).font = { bold: true };

    if (totals && totals.length > 0) {
      const totalRow = sheet.rowCount + 2;
      sheet.getCell(`A${totalRow}`).value = 'Totales por tipo de vehículo';
      sheet.getCell(`A${totalRow}`).font = { bold: true, size: 12 };
      const headerRow = totalRow + 1;
      sheet.getCell(`A${headerRow}`).value = 'Vehículo';
      sheet.getCell(`B${headerRow}`).value = 'Cantidad';
      sheet.getCell(`A${headerRow}`).font = { bold: true };
      sheet.getCell(`B${headerRow}`).font = { bold: true };
      totals.forEach((t, i) => {
        const r = headerRow + 1 + i;
        sheet.getCell(`A${r}`).value = t.vehiculo;
        sheet.getCell(`B${r}`).value = t.total;
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  return res.json({ ok: true, message: 'Datos exportados', data, totals });
}

function parseFormato(req) {
  const f = req.query.formato;
  if (f === 'csv' || f === 'xlsx') return f;
  return 'json';
}

module.exports = { sendExport, parseFormato, jsonToCsv };
