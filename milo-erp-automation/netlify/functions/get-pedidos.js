/**
 * API: GET /.netlify/functions/get-pedidos
 * Obtiene lista de pedidos/documentos del HGI
 * 
 * Parámetros opcionales en query string:
 * - tercero: Código del tercero o * para todos (default: *)
 * - fecha_inicial: Fecha inicial formato YYYY-MM-DD (default: hoy)
 * - fecha_final: Fecha final formato YYYY-MM-DD (default: hoy)
 * 
 * Nota: Solo obtiene transacciones de tipo:
 * - 09 (VALE DEL ABURRA)
 * - 099 (PEDIDOS PARA ALMACENES)
 * - 098 (ORIENTE ANTIOQUEÑO CERCANO)
 * - 091 (DOSQUEBRADAS)
 */

const { fetchHGI } = require('./auth-hgi');

exports.handler = async (event, context) => {
  try {
    // Obtener parámetros de la query string
    const queryParams = event.queryStringParameters || {};
    
    // Valores por defecto
    const today = new Date().toISOString().split('T')[0];
    const tercero = queryParams.tercero || '*';
    const fecha_inicial = queryParams.fecha_inicial || today;
    const fecha_final = queryParams.fecha_final || today;

    // Construir URL con parámetros
    const endpoint = `/ip_servicios_web/Api/Documentos/ObtenerDocumentos?tercero=${tercero}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}`;

    console.log(`📥 Obteniendo pedidos: ${endpoint}`);

    const response = await fetchHGI(endpoint);

    if (!response.ok) {
      throw new Error(`Error HGI ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Filtrar solo transacciones de pedidos (09, 099, 098, 091)
    const pedidosValidos = Array.isArray(data) 
      ? data.filter(doc => ['09', '099', '098', '091'].includes(String(doc.Transaccion || doc.transaccion).trim()))
      : [];

    console.log(`✅ Pedidos obtenidos: ${pedidosValidos.length} de ${Array.isArray(data) ? data.length : 0}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300',
      },
      body: JSON.stringify({
        success: true,
        data: pedidosValidos,
        count: pedidosValidos.length,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en get-pedidos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
