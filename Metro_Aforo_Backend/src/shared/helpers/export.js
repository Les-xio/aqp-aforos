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

async function sendExport(res, data, columns, filename, format) {
  if (format === 'csv') {
    const csv = jsonToCsv(data, columns);
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
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  return res.json({ ok: true, message: 'Datos exportados', data });
}

function parseFormato(req) {
  const f = req.query.formato;
  if (f === 'csv' || f === 'xlsx') return f;
  return 'json';
}

module.exports = { sendExport, parseFormato, jsonToCsv };
