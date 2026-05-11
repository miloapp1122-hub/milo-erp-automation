# 🎯 Milo ERP Automation - Aplicativo Nuevo (v2.0)

**Sistema de automatización integrado con HGI desplegado en Netlify + Google Sheets**

Este es un **aplicativo completamente nuevo y separado** con sincronización automática a Google Sheets y gestión completa de pedidos con GPS.

---

## ✨ Características v2.0

✅ **Sincronización automática** con Google Sheets (7 pestañas)
✅ **Crear pedidos** con GPS en tiempo real
✅ **8 listas de precios** del sistema + opción manual
✅ **Cartera actual** de cada cliente
✅ **Productos con equivalentes** automáticos
✅ **Dashboard en tiempo real** actualizado cada 5 minutos
✅ **Google Apps Script** para automatización
✅ **Reportes automáticos** de sincronización
✅ **Cron jobs** cada 10 minutos
✅ **Renovación automática** de tokens

---

## 📋 Módulos Disponibles

| Módulo | Descripción | Actualización | Datos |
|--------|-------------|--------------|-------|
| 📋 Pedidos | Crear, ver y editar pedidos con GPS | Automática | Tiempo real |
| 💳 Cartera | Saldo actual de cada cliente | Cada hora | Mensual |
| 👥 Empleados | Lista de empleados activos | Cada 15 min | Completo |
| 💼 Vendedores | Vendedores del sistema | Cada 15 min | Completo |
| 📦 Productos | Productos con 8 precios | Cada 10 min | Con equivalentes |
| 👤 Clientes | Lista de clientes activos | Cada 10 min | Actualizada |
| 📊 Reportes | Resumen de sincronización | Automático | En tiempo real |

---

## 🚀 Instalación Rápida

### Paso 1: Preparar Repositorio

```bash
mkdir milo-erp-automation-v2
cd milo-erp-automation-v2
git init
mkdir functions
# Copiar todos los archivos descargados
```

### Paso 2: Configurar Variables (.env)

```bash
cp .env.example .env
nano .env
```

```env
HGI_API_URL=https://900405097.hginet.com.co
HGI_USUARIO=tu_usuario
HGI_PASSWORD=tu_contraseña
CRON_SECRET=aleatorio_seguro
```

### Paso 3: Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea un nuevo documento llamado "Milo ERP Automation"
3. Copia el **Sheet ID** de la URL
4. Comparte el documento con tu email

### Paso 4: Configurar Google Apps Script

1. Abre tu Google Sheet
2. **Extensions** → **Apps Script**
3. Pega el contenido de `google-apps-script.js`
4. Ejecuta `setupSheet()` desde el editor
5. Autoriza los permisos
6. Tu Sheet se configurará automáticamente con 7 pestañas

### Paso 5: Desplegar en Netlify

```bash
git add .
git commit -m "feat: Milo ERP Automation v2.0"
git push origin main
```

En Netlify:
1. **Add new site** → **Import existing project**
2. Conecta tu repositorio
3. Agrega variables de entorno
4. Deploy ✅

---

## 📊 Nuevas APIs

### Crear Pedido
```bash
POST /.netlify/functions/create-pedido
```

**Request:**
```json
{
  "tercero": "1002064264",
  "vendedor": "01",
  "documentoDetalle": [
    {
      "codigo": "00022",
      "cantidad": 5,
      "lista_precio": 1,
      "precio": 40000
    }
  ],
  "gps": {
    "latitud": 6.2176,
    "longitud": -75.5898
  }
}
```

### Obtener Cartera
```bash
GET /.netlify/functions/get-cartera?codigo_tercero=*&codigo_vendedor=*
```

### Sincronizar Google Sheets
```bash
GET /.netlify/functions/sync-google-sheets
```

---

## 🔄 Sincronización Automática

**Google Sheet se actualiza automáticamente:**

| Frecuencia | Tarea | Función |
|-----------|-------|---------|
| Cada 1 hora | Sincronizar todas las pestañas | Google Apps Script |
| Cada 10 min | Obtener datos del HGI | Netlify Cron |
| Cada 15 min | Renovar token | auth-hgi.js |
| En tiempo real | Dashboard actualiza | Frontend (5 min) |

---

## 📱 Dashboard Features

✅ **Contador de registros** por módulo
✅ **Botones de acción rápida** para cada módulo
✅ **Crear pedido** con formulario interactivo
✅ **GPS automático** al crear pedido
✅ **Selección de precios** 1-8 o manual
✅ **Tabla de datos** con scroll horizontal
✅ **Mensajes de éxito/error** en tiempo real
✅ **Última actualización** visible

---

## 🗂️ Estructura Google Sheet

```
Milo ERP Automation/
├── Dashboard
│   ├── Últimas sincronizaciones
│   └── Estado de módulos
├── Empleados
│   ├── Código | Nombre | Estado | Teléfono | ...
│   └── 73 registros
├── Vendedores
│   ├── Código | Nombre | Teléfono | ...
│   └── Automático
├── Productos
│   ├── Código | Descripción | Precio1-8 | Equivalentes | ...
│   └── Automático
├── Pedidos
│   ├── Número | Fecha | Cliente | Total | GPS | ...
│   └── Tiempo real
├── Clientes
│   ├── Identificación | Nombre | Ciudad | Cartera | ...
│   └── Automático
├── Cartera
│   ├── Tercero | Saldo | Vencido | Período | ...
│   └── Mensual
└── Reportes
    ├── Total de registros por módulo
    └── Fecha de última sincronización
```

---

## 🎯 Flujo Completo

1. **Usuario abre Dashboard** en Netlify
2. **Se cargan todos los datos** de HGI en paralelo
3. **Se muestra conteo** de registros en tarjetas
4. **Usuario puede:**
   - 👀 Ver datos en tablas
   - ➕ Crear nuevo pedido con GPS
   - 📊 Ver cartera de clientes
   - 💾 Los datos se sincronizan automáticamente a Google Sheets

5. **Google Sheet se actualiza** cada hora automáticamente
6. **Se generan reportes** de sincronización
7. **Token se renueva** cada 15 minutos

---

## 🔐 Seguridad

✅ **Credenciales en variables de entorno**
✅ **Token renovado antes de expirar**
✅ **`.env` ignorado en Git**
✅ **Headers de seguridad** en Netlify
✅ **CORS configurado**
✅ **Trigger automático** en Google Apps Script

---

## 📞 Troubleshooting

### Google Sheet no se actualiza

**Solución:**
1. Abre el Sheet
2. **Extensions** → **Apps Script**
3. Ejecuta manualmente `sincronizarDatos()`
4. Verifica logs: **View** → **Logs**

### Pedido no se crea

**Causas:**
- Cliente no existe
- Producto no disponible
- Error de autenticación HGI

**Solución:**
1. Verifica credenciales en `.env`
2. Revisa logs en Netlify: **Sitio** → **Logs** → **Functions**
3. Verifica que cliente y producto existan en HGI

### GPS no funciona

**Solución:**
1. Permite ubicación en navegador
2. Abre en HTTPS (Netlify es HTTPS automáticamente)
3. Si no disponible, continúa sin GPS

---

## 📈 Próximos Pasos

- [ ] Integrar con WhatsApp para notificaciones
- [ ] Agregar fotos de productos
- [ ] Descuentos automáticos por volumen
- [ ] Sincronización bidireccional
- [ ] App móvil nativa

---

✨ **¡Sistema listo para producción!** ✨

---

## 📋 Contenido

- [Características](#características)
- [Requisitos](#requisitos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación Rápida](#instalación-rápida)
- [Configuración en Netlify](#configuración-en-netlify)
- [APIs Disponibles](#apis-disponibles)
- [Pruebas Locales](#pruebas-locales)
- [Despliegue a Producción](#despliegue-a-producción)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

✅ **Sincronización en tiempo real** con ERP HGI
✅ **Dashboard interactivo** con contadores de datos
✅ **APIs serverless** en Netlify Functions
✅ **Renovación automática de tokens** (cada 15 minutos)
✅ **Cron jobs** para sincronización periódica
✅ **Soporte Google Sheets** (opcional)
✅ **Cache inteligente** de datos
✅ **Interfaz responsive** y moderna
✅ **Completamente seguro** - credenciales en variables de entorno

---

## 🔧 Requisitos

1. **Cuenta en Netlify** (gratuita)
2. **Credenciales del ERP HGI**:
   - URL base: `https://900405097.hginet.com.co`
   - Usuario y contraseña
3. **Git** instalado localmente
4. **Navegador moderno** (Chrome, Firefox, Safari, Edge)

---

## 📁 Estructura del Proyecto

```
milo-erp-automation/
├── functions/
│   ├── auth-hgi.js              ← Autenticación + gestión de token
│   ├── get-empleados.js         ← API para empleados
│   ├── get-vendedores.js        ← API para vendedores
│   ├── get-productos.js         ← API para productos
│   ├── get-pedidos.js           ← API para pedidos
│   ├── get-clientes.js          ← API para clientes
│   └── sync-data.js             ← Sincronización automática (cron)
├── index.html                    ← Dashboard principal
├── netlify.toml                  ← Configuración de Netlify
├── package.json                  ← Dependencias
├── .env.example                  ← Template de variables
├── .env                          ← Variables locales (NO SUBIR A GIT)
├── .gitignore                    ← Archivos a ignorar
└── README.md                     ← Este archivo
```

---

## 🚀 Instalación Rápida

### Paso 1: Preparar Repositorio Local

```bash
# Crear carpeta del proyecto
mkdir milo-erp-automation
cd milo-erp-automation

# Inicializar Git
git init

# Crear carpeta de functions
mkdir functions

# Copiar archivos descargados
# (Coloca todos los archivos de functions/ en la carpeta functions/)
# (Coloca index.html, netlify.toml, package.json, .env.example en la raíz)
```

### Paso 2: Crear .env Local

```bash
# Copiar template
cp .env.example .env

# Editar .env con tus credenciales del HGI
nano .env
# o usa tu editor preferido
```

Tu `.env` debe verse así:

```env
HGI_API_URL=https://900405097.hginet.com.co
HGI_USUARIO=tu_usuario
HGI_PASSWORD=tu_contraseña
CRON_SECRET=tu_secret_aleatorio
```

### Paso 3: Instalar Dependencias

```bash
npm install
```

### Paso 4: Probar Localmente

```bash
npm start
# Se abrirá en http://localhost:8888
```

---

## 🌐 Configuración en Netlify

### Opción A: Despliegue Automático (Recomendado)

1. **Conectar a Netlify:**
   - Ve a [https://app.netlify.com](https://app.netlify.com)
   - Click en **"Add new site"** → **"Import an existing project"**
   - Selecciona tu repositorio de GitHub/GitLab
   - Conecta tu cuenta

2. **Configurar Build:**
   ```
   Build command: npm install
   Publish directory: .
   Functions directory: functions
   ```

3. **Agregar Variables de Entorno:**
   - Ve a tu sitio → **Site settings** → **Build & deploy** → **Environment**
   - Agrega cada variable del `.env.example`:
     ```
     HGI_API_URL=https://900405097.hginet.com.co
     HGI_USUARIO=tu_usuario
     HGI_PASSWORD=tu_contraseña
     CRON_SECRET=tu_secret
     ```

4. **Iniciar Deploy:**
   - Netlify desplegará automáticamente
   - URL será algo como: `https://milo-erp-test.netlify.app`

---

### Opción B: Deploy Manual por CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Deploy
netlify deploy --prod
```

---

## 🔗 APIs Disponibles

Una vez desplegado, tendrás estos endpoints:

### Empleados
```
GET /.netlify/functions/get-empleados
  ?codigo=*
  &sucursal=*
  &centro_costo=*
  &incluir_foto=false
  &solo_activos=*
```

### Vendedores
```
GET /.netlify/functions/get-vendedores
  ?codigo_vendedor=*
```

### Productos
```
GET /.netlify/functions/get-productos
  ?codigo_producto=0
  &movil=1
  &ecommerce=1
  &estado=1
  &kardex=1
  &incluir_foto=false
```

### Pedidos (Documentos)
```
GET /.netlify/functions/get-pedidos
  ?tercero=*
  &fecha_inicial=2024-01-01
  &fecha_final=2024-12-31
```

### Clientes (Terceros)
```
GET /.netlify/functions/get-clientes
  ?numero_identificacion=0
  &codigo_auxiliar=*
  &codigo_estado=*
  &tipo_tercero=*
  &codigo_ciudad=*
  &codigo_vendedor=*
```

---

## 🧪 Pruebas Locales

### Con Netlify CLI:

```bash
# Terminal 1: Inicia servidor local
netlify dev

# Terminal 2: Prueba las APIs
curl http://localhost:8888/.netlify/functions/get-empleados

# Debería devolver:
# {"success":true,"data":[...],"count":73,"timestamp":"..."}
```

### Con curl directamente:

```bash
# Empleados
curl "http://localhost:8888/.netlify/functions/get-empleados?codigo=*&sucursal=*&centro_costo=*&incluir_foto=false&solo_activos=*"

# Vendedores
curl "http://localhost:8888/.netlify/functions/get-vendedores?codigo_vendedor=*"

# Productos
curl "http://localhost:8888/.netlify/functions/get-productos?codigo_producto=0"
```

### En el navegador:

Abre: `http://localhost:8888`

Verás el dashboard que carga todos los datos automáticamente.

---

## 📤 Despliegue a Producción

### Paso 1: Subir a Git

```bash
git add .
git commit -m "feat: agregar automatización ERP HGI"
git push origin main
```

### Paso 2: Netlify Despliega Automáticamente

Una vez conectado en Netlify, cada push a `main` desplegará automáticamente.

### Paso 3: Verificar Deploy

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Selecciona tu sitio
3. Ve a **Deploys** y verifica que el build fue exitoso
4. Click en tu sitio para abrirlo

---

## ⏰ Cron Jobs Automáticos

Los siguientes cron jobs se ejecutarán automáticamente:

| Tarea | Frecuencia | Función |
|-------|-----------|---------|
| Sincronización de datos | Cada 10 minutos | `sync-data` |
| Renovación de token | Cada 15 minutos | `get-empleados` |

Para ver logs de cron jobs en Netlify:
1. **Sitio** → **Logs** → **Functions**
2. Selecciona la función correspondiente

---

## 🔐 Seguridad

✅ **Credenciales en variables de entorno** (NO hardcodeadas)
✅ **Token renovado automáticamente** (antes de expirar)
✅ **`.env` ignorado en Git** (no se sube el archivo)
✅ **Headers de seguridad** configurados en `netlify.toml`
✅ **CORS habilitado** para tu dominio

### Archivo .gitignore

```
.env
.env.local
node_modules/
.DS_Store
.netlify
```

---

## 🐛 Troubleshooting

### Error: "Login HGI fallido"

**Causas:**
- Usuario/contraseña incorrectos
- Variables de entorno no configuradas
- Servidor HGI no disponible

**Solución:**
1. Verifica credenciales en Netlify: **Site settings** → **Environment**
2. Prueba localmente: `netlify dev`
3. Revisa logs: **Sitio** → **Logs** → **Functions**

### Error: "Token no encontrado"

**Causa:** El HGI está devolviendo una respuesta diferente

**Solución:**
1. Verifica estructura de respuesta del HGI
2. Actualiza `auth-hgi.js` con la estructura correcta

### Error: "Productos devuelve null"

**Causa:** Algunos endpoints pueden devolver `null` en lugar de arrays

**Solución:** Las funciones ya validan esto. Si persiste, contacta soporte HGI.

### API lenta o timeout

**Solución:**
1. Aumenta timeout en `netlify.toml` (max 26s)
2. Reduce cantidad de datos solicitados
3. Agrega parámetros de filtro más específicos

### Datos no se actualizan

**Causa:** Cache de navegador o Netlify

**Solución:**
```bash
# Forzar redeploy
netlify deploy --prod --trigger
```

---

## 📚 Recursos Útiles

- [Documentación Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Documentación HGI API](tu_doc_hgi_aqui)
- [Documentación Google Sheets API](https://developers.google.com/sheets/api)
- [Variables de Entorno en Netlify](https://docs.netlify.com/configure-builds/environment-variables/)

---

## ✅ Checklist de Configuración

- [ ] Repositorio Git creado
- [ ] `.env.example` completado
- [ ] Variables de entorno en Netlify
- [ ] Sitio conectado en Netlify
- [ ] Build exitoso
- [ ] Dashboard carga sin errores
- [ ] Apis devuelven datos
- [ ] Cron jobs ejecutándose
- [ ] Datos actualizándose automáticamente

---

## 🎉 ¡Listo!

Tu sistema de automatización ERP está en marcha.

**Dashboard:** `https://tu-sitio.netlify.app`
**Funciones:** `https://tu-sitio.netlify.app/.netlify/functions/[nombre]`
**Logs:** Dashboard de Netlify → Logs → Functions

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Netlify
2. Ejecuta `netlify dev` localmente
3. Valida credenciales del HGI
4. Verifica estructura de respuestas del API

---

**Versión:** 1.0.0  
**Última actualización:** 2024  
**Autor:** Tu Nombre
