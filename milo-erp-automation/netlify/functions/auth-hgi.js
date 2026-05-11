/**
 * Función de autenticación HGI
 * Maneja login y renovación de token automáticamente
 * El token dura 20 minutos, se renueva cada 15 minutos
 */

const fetch = require('node-fetch');

// Variables globales para almacenar el token
let tokenCache = {
  token: null,
  expiresAt: null,
};

/**
 * Obtener token válido del HGI
 * Si el token está próximo a expirar, obtiene uno nuevo
 */
async function getValidToken() {
  const now = Date.now();
  
  // Si tenemos un token y no ha expirado, lo retornamos
  if (tokenCache.token && tokenCache.expiresAt && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  // Si no, obtenemos uno nuevo
  return await loginHGI();
}

/**
 * Login en HGI y obtener token
 */
async function loginHGI() {
  try {
    const apiUrl = process.env.HGI_API_URL;
    const usuario = process.env.HGI_USUARIO;
    const password = process.env.HGI_PASSWORD;

    if (!apiUrl || !usuario || !password) {
      throw new Error('Faltan credenciales del HGI en variables de entorno');
    }

    const loginUrl = `${apiUrl}/ip_servicios_web/Api/Login`;

    console.log(`🔐 Intentando login en: ${loginUrl}`);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: usuario,
        clave: password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Login HGI fallido: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extraer token (puede venir como 'token' o 'Token')
    const token = data.token || data.Token || data.data?.token;
    
    if (!token) {
      throw new Error('Token no encontrado en respuesta del HGI');
    }

    // Almacenar token con tiempo de expiración (19 minutos para seguridad)
    tokenCache.token = token;
    tokenCache.expiresAt = Date.now() + (19 * 60 * 1000); // 19 minutos

    console.log('✅ Token HGI obtenido exitosamente');
    return token;
  } catch (error) {
    console.error('❌ Error en login HGI:', error.message);
    throw error;
  }
}

/**
 * Realizar petición autenticada al API del HGI
 */
async function fetchHGI(endpoint, options = {}) {
  const token = await getValidToken();
  const apiUrl = process.env.HGI_API_URL;
  const url = `${apiUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  console.log(`📡 Llamando: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token expiró (401), intentamos obtener uno nuevo y reintentar
  if (response.status === 401) {
    console.log('⚠️  Token expirado, renovando...');
    tokenCache.token = null;
    tokenCache.expiresAt = null;
    
    const newToken = await getValidToken();
    const retryHeaders = {
      ...headers,
      'Authorization': `Bearer ${newToken}`,
    };

    return fetch(url, {
      ...options,
      headers: retryHeaders,
    });
  }

  return response;
}

module.exports = {
  getValidToken,
  loginHGI,
  fetchHGI,
};
