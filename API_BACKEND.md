# Guía de Conexión al API (Frontend)

Esta guía detalla cómo el frontend debe interactuar con el backend para la visualización de proyectos y actualización de disponibilidad.

## 1. Configuración de Base URL

- **Local (Emuladores):** `http://localhost:5001/<TU_PROJECT_ID>/us-central1/api`
- **Producción:** `https://<REGION>-<TU_PROJECT_ID>.cloudfunctions.net/api`

## 2. Autenticación

El API utiliza **Firebase Authentication**. Todas las rutas requieren un token de identificación de Firebase válido enviado en el header `Authorization`.

### Cómo obtener el token:

```javascript
import { getAuth } from 'firebase/auth'

const auth = getAuth()
const user = auth.currentUser

if (user) {
  const token = await user.getIdToken()
  // Enviar este token en el header de tus peticiones
}
```

### Formato del Header:

```http
Authorization: Bearer <ID_TOKEN>
Content-Type: application/json
```

## 3. Formato Estándar de Respuesta

El API siempre responde con un objeto JSON:

### Éxito (Success)

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

## 4. Endpoints de Proyectos (`/projects`)

| Método | Endpoint                     | Descripción                                                                                  |
| :----- | :--------------------------- | :------------------------------------------------------------------------------------------- |
| `GET`  | `/projects`                  | Lista todos los proyectos a los que el usuario tiene acceso.                                 |
| `GET`  | `/projects/:id`              | Obtiene los detalles técnicos y de configuración de un proyecto específico.                  |
| `PUT`  | `/projects/:id`              | Actualiza la información básica o configuración de un proyecto existente.                    |
| `POST` | `/projects/:id/availability` | **Carga de Inventario:** Actualiza masivamente el estado de disponibilidad (lotes/unidades). |

## 5. Estructura de las Unidades (Disponibilidad)

Al enviar datos al endpoint de `/availability`, el objeto debe seguir esta estructura:

```json
{
  "id": "MZ-A-LT-01",
  "block": "A",
  "lot": "01",
  "status": "available",
  "price": 50000,
  "area": 120.5
}
```

## 6. Visualización en Tiempo Real (RTDB)

Para mostrar las unidades en el frontend (ej: un mapa de lotes) de forma reactiva, se debe usar **Firebase Realtime Database**. El backend sincroniza automáticamente los datos aquí.

### Ruta de Conexión:

`v2/projects/data/{projectId}/availability`

### Ejemplo de uso con el SDK de Firebase:

```javascript
import { getDatabase, ref, onValue } from 'firebase/database'

const db = getDatabase()
const projectId = 'ID_DEL_PROYECTO'
const availabilityRef = ref(db, `v2/projects/data/${projectId}/availability`)

onValue(availabilityRef, (snapshot) => {
  const unidades = snapshot.val()
  // 'unidades' es un objeto donde cada llave es el ID de la unidad
  console.log(unidades)
})
```

## 7. Códigos de Estado Comunes

- `200 OK`: Operación exitosa.
- `400 Bad Request`: Los datos enviados no cumplen con el formato requerido.
- `401 Unauthorized`: No hay una sesión activa o el token expiró.
- `403 Forbidden`: No tienes permisos para modificar este proyecto.
- `404 Not Found`: El proyecto no existe.
- `500 Internal Server Error`: Error interno del servidor.
