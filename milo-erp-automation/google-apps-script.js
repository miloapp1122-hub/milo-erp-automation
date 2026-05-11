/**
 * Google Apps Script para Milo ERP Automation
 * 
 * INSTALACIÓN:
 * 1. Abre Google Sheets
 * 2. Extensions → Apps Script
 * 3. Pega este código completo
 * 4. Ejecuta: setupSheet()
 * 5. Autoriza los permisos
 * 6. Ejecuta trigger automático
 */

// Configuración
const CONFIG = {
  API_BASE: 'https://tu-sitio.netlify.app/.netlify/functions', // CAMBIAR A TU DOMINIO
  MODULOS: ['Empleados', 'Vendedores', 'Productos', 'Pedidos', 'Clientes', 'Cartera', 'Reportes'],
};

/**
 * Función inicial para configurar el Sheet
 */
function setupSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const nombreSheet = 'Milo ERP - ' + new Date().toLocaleDateString();
  
  // Renombrar hoja principal
  const sheet = spreadsheet.getActiveSheet();
  sheet.setName('Dashboard');

  // Crear pestañas para cada módulo
  CONFIG.MODULOS.forEach(modulo => {
    try {
      spreadsheet.insertSheet(modulo);
    } catch (e) {
      Logger.log(`Pestaña ${modulo} ya existe`);
    }
  });

  // Crear dashboard inicial
  crearDashboard(sheet);
  
  // Crear trigger para sincronizar cada hora
  crearTriggerAutomatico();
  
  Logger.log('✅ Sheet configurado exitosamente');
}

/**
 * Crear dashboard principal
 */
function crearDashboard(sheet) {
  const hoy = new Date().toLocaleDateString();
  const contenido = [
    ['🎯 MILO ERP AUTOMATION - DASHBOARD'],
    [''],
    ['Última sincronización:', new Date().toLocaleString()],
    [''],
    ['MÓDULOS DISPONIBLES'],
    ['Módulo', 'Registros', 'Estado', 'Última Actualización'],
    ['Empleados', '=COUNTA(Empleados!A:A)-1', '=SI(INDIRECTO("B6")>0,"✅","⏳")', ''],
    ['Vendedores', '=COUNTA(Vendedores!A:A)-1', '=SI(INDIRECTO("B7")>0,"✅","⏳")', ''],
    ['Productos', '=COUNTA(Productos!A:A)-1', '=SI(INDIRECTO("B8")>0,"✅","⏳")', ''],
    ['Pedidos', '=COUNTA(Pedidos!A:A)-1', '=SI(INDIRECTO("B9")>0,"✅","⏳")', ''],
    ['Clientes', '=COUNTA(Clientes!A:A)-1', '=SI(INDIRECTO("B10")>0,"✅","⏳")', ''],
    ['Cartera', '=COUNTA(Cartera!A:A)-1', '=SI(INDIRECTO("B11")>0,"✅","⏳")', ''],
  ];

  // Insertar datos
  sheet.getRange(1, 1, contenido.length, contenido[0].length).setValues(contenido);

  // Formatear encabezados
  sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold').setBackground('#0F6E56').setFontColor('white');
  sheet.getRange(5, 1, 1, 4).setFontWeight('bold').setBackground('#e0e0e0');
  sheet.getRange(6, 1, 6, 4).setFontFamily('Arial').setFontSize(11);

  // Ajustar ancho de columnas
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 150);
}

/**
 * Sincronizar datos desde las APIs
 */
function sincronizarDatos() {
  Logger.log('🔄 Iniciando sincronización...');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const timestamp = new Date().toLocaleString();

  // Sincronizar cada módulo
  sincronizarModulo('Empleados', 'get-empleados');
  sincronizarModulo('Vendedores', 'get-vendedores');
  sincronizarModulo('Productos', 'get-productos');
  sincronizarModulo('Pedidos', 'get-pedidos');
  sincronizarModulo('Clientes', 'get-clientes');
  sincronizarModulo('Cartera', 'get-cartera');

  // Actualizar timestamp en dashboard
  const dashboardSheet = spreadsheet.getSheetByName('Dashboard');
  dashboardSheet.getRange('B3').setValue(timestamp);

  Logger.log('✅ Sincronización completada');
}

/**
 * Sincronizar un módulo específico
 */
function sincronizarModulo(nombrePestaña, endpoint) {
  try {
    Logger.log(`📥 Sincronizando ${nombrePestaña}...`);

    // Obtener datos de la API
    const url = `${CONFIG.API_BASE}/${endpoint}`;
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
    });

    const resultado = JSON.parse(response.getContentText());

    if (!resultado.success || !resultado.data) {
      throw new Error(`Error en ${nombrePestaña}: ${resultado.error}`);
    }

    const datos = resultado.data;
    if (datos.length === 0) {
      Logger.log(`⚠️  ${nombrePestaña}: Sin datos`);
      return;
    }

    // Obtener o crear pestaña
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(nombrePestaña);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(nombrePestaña);
    } else {
      sheet.clear();
    }

    // Extraer encabezados
    const encabezados = Object.keys(datos[0]);
    
    // Preparar filas
    const filas = [
      encabezados,
      ...datos.map(fila => encabezados.map(header => fila[header] || '')),
    ];

    // Insertar datos
    if (filas.length > 0 && filas[0].length > 0) {
      sheet.getRange(1, 1, filas.length, filas[0].length).setValues(filas);

      // Formatear encabezado
      sheet.getRange(1, 1, 1, filas[0].length).setFontWeight('bold').setBackground('#0F6E56').setFontColor('white');

      // Congelar encabezado
      sheet.setFrozenRows(1);

      // Ajustar ancho de columnas
      for (let i = 1; i <= filas[0].length; i++) {
        sheet.autoResizeColumn(i);
      }
    }

    Logger.log(`✅ ${nombrePestaña}: ${datos.length} registros`);
  } catch (error) {
    Logger.log(`❌ Error en ${nombrePestaña}: ${error}`);
  }
}

/**
 * Crear trigger automático para sincronizar cada hora
 */
function crearTriggerAutomatico() {
  // Eliminar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sincronizarDatos') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Crear nuevo trigger (cada hora)
  ScriptApp.newTrigger('sincronizarDatos')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('✅ Trigger automático creado (cada hora)');
}

/**
 * Crear Google Sheet nuevo (llamar desde terminal)
 */
function crearSheetNuevo() {
  const folder = DriveApp.getRootFolder();
  const nombre = 'Milo ERP Automation - ' + new Date().toLocaleDateString();
  
  // Crear spreadsheet
  const spreadsheet = SpreadsheetApp.create(nombre);
  const id = spreadsheet.getId();

  Logger.log('✅ Nuevo Sheet creado: ' + id);
  Logger.log('URL: https://docs.google.com/spreadsheets/d/' + id);

  // Configurar
  setupSheet();
  
  return id;
}

/**
 * Exportar datos a CSV (descargar)
 */
function exportarCSV(nombrePestaña) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(nombrePestaña);

  if (!sheet) {
    throw new Error('Pestaña no encontrada: ' + nombrePestaña);
  }

  const datos = sheet.getDataRange().getValues();
  let csv = '';

  datos.forEach(fila => {
    csv += fila.map(celda => `"${celda}"`).join(',') + '\n';
  });

  // Crear blob descargable
  const blob = Utilities.newBlob(csv, 'text/csv', nombrePestaña + '.csv');
  DriveApp.createFile(blob);

  Logger.log('✅ CSV exportado: ' + nombrePestaña + '.csv');
}

/**
 * Obtener resumen de todos los módulos
 */
function obtenerResumen() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const resumen = {};

  CONFIG.MODULOS.forEach(modulo => {
    const sheet = spreadsheet.getSheetByName(modulo);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      resumen[modulo] = lastRow > 1 ? lastRow - 1 : 0; // -1 por encabezado
    }
  });

  Logger.log('📊 Resumen:', resumen);
  return resumen;
}

/**
 * Crear reporte personalizado
 */
function crearReporte() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Reporte');
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Reporte');
  } else {
    sheet.clear();
  }

  const resumen = obtenerResumen();
  const contenido = [
    ['📊 REPORTE MILO ERP'],
    [''],
    ['Fecha de Generación', new Date().toLocaleString()],
    [''],
    ['RESUMEN POR MÓDULO'],
    ['Módulo', 'Registros', 'Porcentaje'],
  ];

  const total = Object.values(resumen).reduce((a, b) => a + b, 0);

  Object.keys(resumen).forEach(modulo => {
    const count = resumen[modulo];
    const porcentaje = total > 0 ? ((count / total) * 100).toFixed(2) : 0;
    contenido.push([modulo, count, porcentaje + '%']);
  });

  contenido.push(['']);
  contenido.push(['TOTAL', total, '100%']);

  // Insertar datos
  sheet.getRange(1, 1, contenido.length, 3).setValues(contenido);

  // Formatear
  sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold').setBackground('#0F6E56').setFontColor('white');
  sheet.getRange(5, 1, 1, 3).setFontWeight('bold').setBackground('#e0e0e0');
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 100);

  Logger.log('✅ Reporte creado');
}

// Ejecutar al abrir
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🎯 Milo ERP')
    .addItem('🔄 Sincronizar Ahora', 'sincronizarDatos')
    .addItem('📊 Generar Reporte', 'crearReporte')
    .addItem('📥 Exportar CSV', 'mostrarDialogoExportar')
    .addItem('⚙️ Configurar', 'setupSheet')
    .addToUi();
}

function mostrarDialogoExportar() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const modulos = CONFIG.MODULOS;
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('¿Qué pestaña deseas exportar? (' + modulos.join(', ') + ')');
  
  if (response.getSelectedButton() === ui.Button.OK) {
    exportarCSV(response.getResponseText());
  }
}
