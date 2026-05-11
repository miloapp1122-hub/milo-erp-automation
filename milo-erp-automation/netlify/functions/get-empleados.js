/**
 * API: GET /.netlify/functions/get-empleados
 * Obtiene lista de empleados del HGI
 * 
 * Parámetros opcionales en query string:
 * - codigo: Código del empleado o * para todos (default: *)
 * - sucursal: Código de sucursal o * para todas (default: *)
 * - centro_costo: Código de centro de costo o * para todos (default: *)
 * - incluir_foto: true/false para incluir fotos (default: false)
 * - solo_activos: * para todos o estado específico (default: *)
 */

const { fetchHGI } = require('./auth-hgi');

exports.handler = async (event, context) => {
  try {
    // Obtener parámetros de la query string
    const queryParams = event.queryStringParameters || {};
    
    const codigo = queryParams.codigo || '*';
    const sucursal = queryParams.sucursal || '*';
    const centro_costo = queryParams.centro_costo || '*';
    const incluir_foto = queryParams.incluir_foto || 'false';
    const solo_activos = queryParams.solo_activos || '*';

    // Construir URL con parámetros
    const endpoint = `/ip_servicios_web/Api/Empleados/Obtener?codigo=${codigo}&sucursal=${sucursal}&centro_costo=${centro_costo}&incluir_foto=${incluir_foto}&solo_activos=${solo_activos}`;

    console.log(`📥 Obteniendo empleados: ${endpoint}`);

    const response = await fetchHGI(endpoint);

    if (!response.ok) {
      throw new Error(`Error HGI ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Empleados obtenidos: ${Array.isArray(data) ? data.length : 'datos procesados'}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300', // Cache de 5 minutos
      },
      body: JSON.stringify({
        success: true,
        data: data,
        count: Array.isArray(data) ? data.length : 0,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en get-empleados:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
