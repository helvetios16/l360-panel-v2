# Guía de Conexión al API (Frontend)

Guía para usuarios con rol **no-admin** (editor, client, etc.). Cubre los endpoints y funcionalidades accesibles según permisos asignados.

## 1. Configuración de Base URL

- **Local (Emuladores):** `http://localhost:5001/<TU_PROJECT_ID>/us-central1/api`
- **Producción:** `https://<REGION>-<TU_PROJECT_ID>.cloudfunctions.net/api`

## 2. Autenticación

Todas las rutas requieren un token de **Firebase Authentication** en el header `Authorization`.

### Obtener el token:

```javascript
import { getAuth } from "firebase/auth";

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
}
```

### Header requerido:

```http
Authorization: Bearer <ID_TOKEN>
Content-Type: application/json
```

> **Nota:** El token incluye custom claims con tu `role` y `permissions`. Estos se sincronizan automáticamente cuando un admin modifica tu rol.

## 3. Formato de Respuesta

### Éxito

```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

### Error

```json
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "errors": []
}
```

## 4. Permisos

Tu acceso depende de los permisos asociados a tu rol. Los permisos relevantes son:

| Permiso | Permite |
| :--- | :--- |
| `viewProjects` | Ver proyectos asignados |
| `editAvailability` | Modificar datos de proyecto y disponibilidad |

Solo puedes ver y operar sobre **proyectos a los que estés asignado** (campo `users` del proyecto).

## 5. Endpoints Disponibles

### Proyectos

| Método | Endpoint | Permiso requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects` | Autenticado | Lista los proyectos a los que estás asignado. |
| `GET` | `/projects/:id` | Autenticado | Detalle de un proyecto (solo si estás asignado). |
| `PUT` | `/projects/:id` | `editAvailability` | Actualiza información del proyecto. |
| `POST` | `/projects/:id/availability` | `editAvailability` | Actualiza un ítem de disponibilidad (lote/unidad). |

### GET /projects

Retorna solo los proyectos donde `users[tu_uid] === true`.

```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Residencial Norte",
      "client": "Inmobiliaria XYZ",
      "typeProject": "lotizer",
      "paymentStatus": "paid",
      "maintenanceMode": false
    }
  ]
}
```

### PUT /projects/:id

Campos actualizables (todos opcionales):

```json
{
  "name": "Nuevo nombre",
  "client": "Nuevo cliente",
  "description": "Descripción actualizada",
  "url": "https://ejemplo.com",
  "thumbnailUrl": "https://ejemplo.com/thumb.jpg",
  "paymentStatus": "paid",
  "maintenanceMode": false
}
```

Valores válidos de `paymentStatus`: `"paid"`, `"notPaid"`, `"inProgress"`.

### POST /projects/:id/availability

Envía **un ítem** de disponibilidad para crear o actualizar:

```json
{
  "id": "MZ-A-LT-01",
  "block": "A",
  "lot": 1,
  "status": "available",
  "price": 50000,
  "m2": 120.5,
  "perimeter": 48.0,
  "front": 10.0,
  "left": 15.0,
  "right": 15.0,
  "back": 8.0
}
```

#### Campos obligatorios

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | string | Identificador único del lote (min 1 carácter). |
| `block` | string | Manzana o bloque (min 1 carácter). |
| `lot` | number | Número de lote (entero positivo). |
| `status` | string | `"blocked"`, `"available"`, `"reserved"` o `"sold"`. |

#### Campos opcionales

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `price` | number | Precio (>= 0). |
| `m2` | number | Superficie en m² (> 0). |
| `perimeter` | number | Perímetro en metros (> 0). |
| `front` | number | Medida frontal (> 0). |
| `left` | number | Medida lateral izquierda (> 0). |
| `right` | number | Medida lateral derecha (> 0). |
| `back` | number | Medida posterior (> 0). |

## 6. Visualización en Tiempo Real (RTDB)

Para mostrar unidades de forma reactiva (ej: mapa de lotes), conectarse a **Firebase Realtime Database**. El backend sincroniza automáticamente los datos de Firestore a RTDB.

### Ruta de conexión:

```
v2/{typeProject}/{projectKey}/data/availability/{availabilityId}
```

- `typeProject`: tipo de proyecto (`"lotizer"` o `"multifamily"`).
- `projectKey`: campo `dbKey` del proyecto (o su `id` si `dbKey` está vacío).

### Ejemplo — Escuchar toda la disponibilidad:

```javascript
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase();
const typeProject = "lotizer";
const projectKey = "residencial-norte";

const availabilityRef = ref(
  db,
  `v2/${typeProject}/${projectKey}/data/availability`
);

onValue(availabilityRef, (snapshot) => {
  const unidades = snapshot.val();
  // 'unidades' es un objeto donde cada llave es el ID de la unidad
  console.log(unidades);
});
```

### Ejemplo — Escuchar una unidad específica:

```javascript
const lotRef = ref(
  db,
  `v2/${typeProject}/${projectKey}/data/availability/MZ-A-LT-01`
);

onValue(lotRef, (snapshot) => {
  const lote = snapshot.val();
  console.log(lote);
});
```

## 7. Códigos de Estado

| Código | Significado |
| :--- | :--- |
| `200` | Operación exitosa. |
| `400` | Datos inválidos (ver campo `errors` en la respuesta). |
| `401` | Token ausente o expirado. |
| `403` | Sin permisos para esta acción o proyecto no asignado. |
| `404` | Recurso no encontrado. |
| `500` | Error interno del servidor. |
