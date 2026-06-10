const https = require('https');

class ReniecService {
  constructor() {
    this.baseUrl = process.env.DNI_API_BASE_URL || 'https://api.decolecta.com';
    this.token = process.env.DNI_API_TOKEN || '';
    this.timeout = parseInt(process.env.DNI_API_TIMEOUT || '10000', 10);
  }

  async consultarPorDni(dni) {
    if (dni.length !== 8) throw new Error('DNI debe tener 8 dígitos');

    const url = new URL(`${this.baseUrl}/v1/reniec/dni`);
    url.searchParams.set('numero', dni);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        timeout: this.timeout,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              return reject(new Error(parsed.error || parsed.message || `Error HTTP ${res.statusCode}`));
            }
            if (parsed.document_number || parsed.first_name) {
              resolve({
                dni: parsed.document_number || dni,
                nombres: (parsed.first_name || '').trim().replace(/\s+/g, ' '),
                apellidoPaterno: (parsed.first_last_name || '').trim().replace(/\s+/g, ' '),
                apellidoMaterno: (parsed.second_last_name || '').trim().replace(/\s+/g, ' '),
                nombreCompleto: (parsed.full_name || '').trim().replace(/\s+/g, ' '),
              });
            } else {
              reject(new Error(parsed.error || parsed.message || 'No se encontraron datos para este DNI'));
            }
          } catch (e) {
            reject(new Error('Error al parsear respuesta de RENIEC'));
          }
        });
      });
      req.on('error', (e) => reject(new Error(`Error de conexión con RENIEC: ${e.message}`)));
      req.on('timeout', () => { req.destroy(); reject(new Error('Tiempo de espera agotado al consultar RENIEC')); });
      req.end();
    });
  }
}

module.exports = ReniecService;
