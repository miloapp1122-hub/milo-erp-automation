/**
 * API: GET /.netlify/functions/get-clientes
 * Obtiene lista de clientes/terceros del HGI
 * 
 * Parámetros opcionales en query string:
 * - numero_identificacion: Número de identificación o 0 para todos (default: 0)
 * - codigo_auxiliar: Código auxiliar o * para todos (default: *)
 * - codigo_estado: Código de estado o * para todos (default: *)
 * - tipo_tercero: Tipo de tercero o * para todos (default: *)
 * - codigo_ciudad: Código de ciudad o * para todos (default: *)
 * - codigo_vendedor: Código de vendedor o * para todos (default: *)
 */

const { fetchHGI } = require('./auth-hgi');

exports.handler = async (event, context) => {
  try {
    // Obtener parámetros de la query string
    const queryParams = event.queryStringParameters || {};
    
    const numero_identificacion = queryParams.numero_identificacion || '0';
    const codigo_auxiliar = queryParams.codigo_auxiliar || '*';
    const codigo_estado = queryParams.codigo_estado || '*';
    const tipo_tercero = queryParams.tipo_tercero || '*';
    const codigo_ciudad = queryParams.codigo_ciudad || '*';
    const codigo_vendedor = queryParams.codigo_vendedor || '*';

    // Construir URL con parámetros
    const endpoint = `/ip_servicios_web/Api/Terceros/ObtenerLista?numero_identificacion=${numero_identificacion}&codigo_auxiliar=${codigo_auxiliar}&codigo_estado=${codigo_estado}&tipo_tercero=${tipo_tercero}&codigo_ciudad=${codigo_ciudad}&codigo_vendedor=${codigo_vendedor}`;

    console.log(`📥 Obteniendo clientes: ${endpoint}`);

    const response = await fetchHGI(endpoint);

    if (!response.ok) {
      throw new Error(`Error HGI ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Clientes obtenidos: ${Array.isArray(data) ? data.length : 'datos procesados'}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300',
      },
      body: JSON.stringify({
        success: true,
        data: data,
        count: Array.isArray(data) ? data.length : 0,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en get-clientes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
