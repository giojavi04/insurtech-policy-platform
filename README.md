# Plataforma Insurtech Quote & Bind

> Take-home técnico para LibélulaSoft. Flujo de cotización y emisión de pólizas: catálogos, cotización, autenticación y emisión.

**Ruta elegida: Fullstack.** Backend en NestJS + Prisma + PostgreSQL con los 8 endpoints REST definidos en el contrato, y frontend en Next.js (App Router) para completar el flujo: elegir seguro y cobertura → cotizar → iniciar sesión → confirmar → emitir póliza → ver confirmación.

El proyecto incluye tests automatizados en backend y frontend, además de CI con GitHub Actions para ejecutar lint, tests y build.

## Estructura del repo

```
.
├── backend/                  API NestJS: catálogos, cotización, auth, emisión de pólizas
├── frontend/                 UI Next.js del flujo cotizar → emitir
├── .github/workflows/ci.yml  CI: backend (Postgres) + frontend
└── package.json              raíz de pnpm workspaces
```

## Arquitectura

El backend está dividido en cuatro módulos siguiendo la estructura `controller → use-case → repository`:

* **`CatalogModule`** — catálogos de tipos de seguro, coberturas y ubicaciones.

* **`QuoteModule`** — valida los datos contra los catálogos, calcula la prima y persiste la cotización.

* **`AuthModule`** — autenticación del usuario demo con bcrypt y JWT.

* **`PolicyModule`** — emisión y consulta de pólizas protegidas mediante Bearer token.

### Separación entre Quote y Policy

Para esta prueba, Quote y Policy se implementaron como módulos independientes dentro de la misma aplicación NestJS. Esto mantiene separados ambos dominios sin agregar la complejidad de desplegar dos servicios.

`PolicyModule` no depende del repository, modelos de Prisma ni DTOs de `QuoteModule`. Para consultar una cotización utiliza `QuoteLookupPort`, que expone únicamente `findById`.

`QuoteModule` implementa este port mediante `InProcessQuoteLookupAdapter`. Actualmente la comunicación es directa dentro del mismo proceso.

Si ambos módulos necesitaran desplegarse por separado, el adapter puede reemplazarse por una implementación HTTP o basada en mensajería sin modificar `IssuePolicyUseCase`.

La relación `Policy.quoteId` tiene una constraint `@unique` en base de datos para garantizar una sola póliza por cotización.

## Cálculo de la prima

El cálculo se encuentra en `backend/src/domain/premium/` y no tiene dependencias externas. La prima se obtiene a partir de un valor base más los factores de edad, ubicación y cobertura:

```
estimatedPremium = BASE[tipo]
                 + BASE[tipo] × AGE_RATE[rango de edad]
                 + BASE[tipo] × LOCATION_RATE[ubicación]
                 + BASE[tipo] × COVERAGE_RATE[cobertura]
```

| Tabla           | Valores                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| `BASE`          | AUTO 200.00 · SALUD 150.00 · HOGAR 120.00                                          |
| `AGE_RATE`      | 18–25 → 0.40 · 26–35 → 0.30 · 36–50 → 0.20 · 51–65 → 0.35 · 66–99 → 0.50           |
| `LOCATION_RATE` | EC-AZUAY 0.20 · EC-PICHINCHA 0.25 · EC-GUAYAS 0.30 · EC-MANABI 0.22 · EC-LOJA 0.15 |
| `COVERAGE_RATE` | BASICA 0.00 · ESTANDAR 0.12 · PREMIUM 0.25                                         |

**Ejemplo** — `insuranceType=AUTO, coverage=PREMIUM, age=35, location=EC-AZUAY`:

| Concepto               | Cálculo      | Monto      |
| ---------------------- | ------------ | ---------- |
| `BASE`                 | `BASE[AUTO]` | 200.00     |
| `AGE_FACTOR`           | `200 × 0.30` | 60.00      |
| `LOCATION_FACTOR`      | `200 × 0.20` | 40.00      |
| `COVERAGE_FACTOR`      | `200 × 0.25` | 50.00      |
| **`estimatedPremium`** |              | **350.00** |

Los valores monetarios utilizan `Decimal(10,2)` de Prisma y `decimal.js` para evitar problemas de precisión con floats.

## Formato de errores

Los endpoints utilizan una estructura común de error basada en RFC 7807:

```json
{
  "type": "https://libelulasoft.local/problems/catalog-value-invalid",
  "title": "Catalog value invalid",
  "status": 400,
  "detail": "Coverage 'PREMIUM' is not available for insurance type 'HOGAR'.",
  "code": "CATALOG_VALUE_INVALID",
  "instance": "/quotes",
  "errors": [
    {
      "field": "coverage",
      "message": "not available for the selected insurance type"
    }
  ]
}
```

Códigos disponibles: `VALIDATION_FAILED` (400) · `CATALOG_VALUE_INVALID` (400) · `INVALID_CREDENTIALS` (401) · `UNAUTHENTICATED` (401) · `QUOTE_NOT_FOUND` (404) · `POLICY_NOT_FOUND` (404) · `POLICY_ALREADY_ISSUED` (409) · `INTERNAL_ERROR` (500).

El frontend utiliza `code` para mapear los errores a mensajes de usuario y no depende del contenido de `detail`.

## Puesta en marcha local

```bash
# 1. Variables de entorno
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# 2. Instalar dependencias
pnpm install

# 3. Levantar PostgreSQL
docker run -d --name insurtech-pg \
  -e POSTGRES_USER=insurtech -e POSTGRES_PASSWORD=insurtech -e POSTGRES_DB=insurtech_dev \
  -p 5432:5432 postgres:16

# 4. Migrar y sembrar
pnpm --filter backend prisma:migrate
pnpm --filter backend prisma:seed

# 5. Correr las apps
pnpm run dev:backend
pnpm run dev:frontend
```

Variables de backend: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`.

Variable de frontend: `NEXT_PUBLIC_API_URL`.

Swagger disponible en `http://localhost:3000/docs`.

## Endpoints

| Método y ruta                            | Auth       | Request                                    | Response                                                           |
| ---------------------------------------- | ---------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `GET /catalogs/insurance-types`          | —          | —                                          | `200 { items: [{code, name}] }`                                    |
| `GET /catalogs/coverages?insuranceType=` | —          | query `insuranceType`                      | `200 { items }`, `400` si falta/inválido                           |
| `GET /catalogs/locations`                | —          | —                                          | `200 { items }`                                                    |
| `POST /quotes`                           | —          | `{insuranceType, coverage, age, location}` | `201 {id, status, inputs, estimatedPremium, breakdown, createdAt}` |
| `GET /quotes/{id}`                       | —          | —                                          | `200`, `404`                                                       |
| `POST /auth/login`                       | —          | `{email, password}`                        | `200 {accessToken, tokenType}`, `401`                              |
| `POST /policies`                         | **Bearer** | `{quoteId}`                                | `201 {id, quoteId, status, issuedAt}`, `401`/`404`/`409`           |
| `GET /policies/{id}`                     | **Bearer** | —                                          | `200`, `401`/`404`                                                 |

Para las rutas de pólizas se debe obtener primero el `accessToken` mediante `POST /auth/login` y enviarlo como `Authorization: Bearer <token>`.

## Catálogos

* **Tipos de seguro:** `AUTO`, `SALUD`, `HOGAR`
* **Coberturas:** `BASICA`, `ESTANDAR`, `PREMIUM` para AUTO y SALUD; `BASICA` y `ESTANDAR` para HOGAR
* **Ubicaciones:** `EC-AZUAY`, `EC-PICHINCHA`, `EC-GUAYAS`, `EC-MANABI`, `EC-LOJA`

## Alcance y simplificaciones

Por el tiempo disponible para la prueba se dejaron fuera los siguientes puntos:

* Quote y Policy se ejecutan como módulos del mismo backend y no como servicios desplegables por separado.
* Se utiliza un único usuario demo, sin registro de usuarios.
* No se implementó broker de mensajería, RBAC, multi-tenancy ni rate limiting.
* El JWT se mantiene en memoria en el frontend, por lo que al recargar es necesario iniciar sesión nuevamente.
* Las tarifas se mantienen como constantes en código.
* No se implementaron pagos, facturación, cancelación ni renovación de pólizas.
* No existe endpoint para listar pólizas.
* No se implementó integración con Apple/Google Wallet.
* El PDF se obtiene mediante `window.print()`.
* El digest SHA-256 y la fecha de vigencia mostrados en el frontend son valores derivados.
* No se implementó recuperación de contraseña.

## Estado

Backend y frontend completos con tests automatizados. El pipeline de GitHub Actions ejecuta lint, tests y build para ambos proyectos en cada push y pull request a `main`.
