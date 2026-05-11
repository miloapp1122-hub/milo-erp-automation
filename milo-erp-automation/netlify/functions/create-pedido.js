/**
 * API: POST /.netlify/functions/create-pedido
 * Crear nuevo pedido con:
 * - GPS automático
 * - 8 precios del sistema
 * - Opción de precio manual
 * - Equivalentes de productos
 * - Cartera del cliente
 */

const { fetchHGI } = require('./auth-hgi');

exports.handler = async (event, context) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  try {
    const pedido = JSON.parse(event.body);

    console.log(`📝 Creando pedido:`, pedido);

    // Validar campos requeridos
    if (!pedido.tercero || !pedido.documentoDetalle || pedido.documentoDetalle.length === 0) {
      throw new Error('Faltan campos requeridos: tercero y documentoDetalle');
    }

    // Si hay GPS, agregarlo
    if (pedido.gps && pedido.gps.latitud && pedido.gps.longitud) {
      pedido.TrazasGPS = [{
        Latitud: pedido.gps.latitud,
        Longitud: pedido.gps.longitud,
        Fecha: new Date().toISOString(),
        Usuario: pedido.usuario || 'SISTEMA',
      }];
    }

    // Procesar detalles del pedido (aplicar precios y equivalentes)
    const detalles = await Promise.all(
      pedido.documentoDetalle.map(async (detalle) => {
        // Obtener información del producto (incluyendo equivalentes)
        const producto = await obtenerProductoConEquivalentes(detalle.codigo);

        // Aplicar precio según lista_precio seleccionada
        let precioFinal = detalle.precioManual || detalle.precio;
        
        if (!detalle.precioManual && detalle.lista_precio) {
          const listaPrecio = Math.min(8, Math.max(1, detalle.lista_precio));
          precioFinal = producto[`Precio${listaPrecio}`] || detalle.precio;
        }

        return {
          ...detalle,
          Producto: detalle.codigo,
          Cantidad: detalle.cantidad,
          BaseP: precioFinal,
          Valor: precioFinal * detalle.cantidad,
          ProductoInfo: producto,
          ProductosEquivalentes: producto.ProductosRelacionados || [],
        };
      })
    );

    // Calcular totales
    const subtotal = detalles.reduce((sum, d) => sum + (d.Valor || 0), 0);
    const descuento = pedido.descuento || 0;
    const iva = (subtotal - descuento) * 0.16;
    const total = subtotal - descuento + iva;

    // Construir documento final
    const documento = {
      DatosTercero: null,
      Empresa: pedido.empresa || 0,
      Transaccion: pedido.transaccion || '09', // 09 = VALE DEL ABURRA
      Fecha: new Date().toISOString().split('T')[0],
      Vencimiento: pedido.vencimiento || new Date().toISOString().split('T')[0],
      Tercero: pedido.tercero,
      Vendedor: pedido.vendedor || '0',
      Bodega: pedido.bodega || '01',
      Sucursal: pedido.sucursal || '0',
      CentroCosto: pedido.centro_costo || null,
      Moneda: pedido.moneda || null,
      Valor: subtotal,
      Subtotal: subtotal,
      DescuentoTotalDocumento: descuento,
      Iva: iva,
      Total: total,
      Observaciones: pedido.observaciones || null,
      Estado: pedido.estado || 0,
      DocumentoDetalle: detalles.map(d => ({
        Producto: d.Producto,
        Cantidad: d.Cantidad,
        BaseP: d.BaseP,
        Valor: d.Valor,
      })),
      TrazasGPS: pedido.TrazasGPS || null,
      IdSeguridad: pedido.idSeguridad || '00000000-0000-0000-0000-000000000000',
    };

    console.log(`📋 Documento generado:`, documento);

    // Enviar a HGI
    const response = await fetchHGI('/ip_servicios_web/Api/Documentos/Crear', {
      method: 'POST',
      body: JSON.stringify([documento]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HGI ${response.status}: ${errorText}`);
    }

    const resultado = await response.json();

    console.log(`✅ Pedido creado exitosamente:`, resultado);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Pedido creado correctamente',
        data: {
          documento: documento,
          resultado: resultado,
          resumen: {
            subtotal,
            descuento,
            iva,
            total,
            items: detalles.length,
            gps: pedido.gps ? '✅ Con GPS' : '❌ Sin GPS',
          },
        },
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en create-pedido:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};

/**
 * Obtener información del producto con equivalentes
 * IMPORTANTE: Si es un equivalente, trae los datos REALES del equivalente
 */
async function obtenerProductoConEquivalentes(codigo) {
  try {
    // Primero, obtener el producto principal
    let response = await fetchHGI(`/ip_servicios_web/Api/Productos/ObtenerProductos?codigo_producto=${codigo}&movil=1&ecommerce=1&estado=1&kardex=1&incluir_foto=false`);
    
    if (!response.ok) {
      throw new Error(`No se encontró producto ${codigo}`);
    }

    let producto = await response.json();
    producto = Array.isArray(producto) ? producto[0] : producto;

    // Obtener equivalentes (ProductosRelacionados, ProductosRentables, ProductosCruzados)
    const codigosEquivalentes = [
      ...(producto.ProductosRelacionados || []),
      ...(producto.ProductosRentables || []),
      ...(producto.ProductosCruzados || []),
    ].filter(c => c && c !== '0' && c !== '');

    // Obtener datos REALES de cada equivalente
    const equivalentes = [];
    for (const codigoEq of codigosEquivalentes) {
      try {
        const responseEq = await fetchHGI(`/ip_servicios_web/Api/Productos/ObtenerProductos?codigo_producto=${codigoEq}&movil=1&ecommerce=1&estado=1&kardex=1&incluir_foto=false`);
        
        if (responseEq.ok) {
          const datosEq = await responseEq.json();
          const productoEq = Array.isArray(datosEq) ? datosEq[0] : datosEq;
          
          // Guardar datos REALES del equivalente
          equivalentes.push({
            Codigo: productoEq.Codigo,
            Descripcion: productoEq.Descripcion,
            Precio1: productoEq.Precio1,
            Precio2: productoEq.Precio2,
            Precio3: productoEq.Precio3,
            Precio4: productoEq.Precio4,
            Precio5: productoEq.Precio5,
            Precio6: productoEq.Precio6,
            Precio7: productoEq.Precio7,
            Precio8: productoEq.Precio8,
            Vigente: productoEq.Vigente,
            Movil: productoEq.Movil,
            Ecommerce: productoEq.Ecommerce,
          });
        }
      } catch (e) {
        console.warn(`No se pudo obtener equivalente ${codigoEq}:`, e);
      }
    }

    // Retornar producto con sus equivalentes REALES
    return {
      ...producto,
      EquivalentesReales: equivalentes,
    };
  } catch (error) {
    console.error(`Error obteniendo producto ${codigo}:`, error);
    return { Codigo: codigo };
  }
}
