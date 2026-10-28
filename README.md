# Stockroom — Inventory Management

A local inventory application for managing shop products. The React interface talks to a Java Spring Boot REST API; product data is stored in a local H2 database file and remains available after restarting the backend.

## Requirements

- Java 17 or newer
- Maven 3.8+
- Node.js 20.19+ and npm (required by Vite 8)

## Run locally

Open two terminals from the project root.

**Terminal 1 — backend**

```bash
cd backend
mvn spring-boot:run
```

The API starts at <http://localhost:8082>. H2 stores data under `backend/data/`.
If port 8082 is already in use, set `SERVER_PORT` to a free port when starting
the backend and update the proxy target in `frontend/vite.config.ts` to match.

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5176>. Vite proxies `/api` requests to the backend.

## Features

- Add products with a unique ID, name, non-negative price, and non-negative whole-number quantity.
- Assign products to a category and filter the inventory by category.
- View product quantities, prices in Indian rupees (₹), total units, and estimated stock value.
- View a category breakdown and restock alerts for products with fewer than five units.
- Search by product name or ID.
- Update product price and/or quantity.
- Highlight products with fewer than five units.
- Persist inventory in a local H2 database (Render's free filesystem is temporary; see deployment notes).

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/products` | List products; optionally pass `?search=tea` to search names, IDs, or categories |
| `GET` | `/api/products/{productId}` | Get one product |
| `POST` | `/api/products` | Create a product |
| `PATCH` | `/api/products/{productId}` | Update `price`, `quantity`, and/or `category` |

Example create request:

```json
{
  "productId": "TEA-001",
  "name": "Green tea",
  "price": 3.5,
  "quantity": 12,
  "category": "Beverages"
}
```

The H2 console is available at <http://localhost:8082/h2-console> while the backend is running. Enter these values on the login page:

- JDBC URL: `jdbc:h2:file:./data/inventorydb`
- User Name: `sa`
- Password: leave blank

## Verify

```bash
cd backend && mvn test
cd ../frontend && npm install && npm run build
```

## Deploy to Render and Vercel

The deployment configuration is prepared for a standalone GitHub repository containing these project files at its root:

- `render.yaml` and `backend/Dockerfile` configure the Spring Boot API on Render's free web-service plan.
- `frontend/vercel.json` configures the Vite single-page app for Vercel.

1. Push the contents of this project folder to a GitHub repository you control.
2. In Render, create a new Blueprint from that repository and apply `render.yaml`. The API service URL will look like `https://stockroom-api.onrender.com`.
3. In the Vercel dashboard, import the same repository and set **Root Directory** to `frontend`. Set the environment variable `VITE_API_BASE_URL` to the Render API origin, with no trailing slash (for example, `https://stockroom-api.onrender.com`), then deploy.
4. Once Vercel assigns the site URL, tighten Render's `CORS_ALLOWED_ORIGINS` environment variable to that exact URL, such as `https://your-project.vercel.app`, and redeploy the API.

Render's free service uses an ephemeral filesystem. The H2 database file is kept at `/tmp/inventorydb` while the service is running, but **may be erased on restart or redeploy**. Render persistent disks require a paid service; choose one before using this app for important inventory. The deployed H2 console is disabled, and Render generates a database password automatically. Local development continues to use the H2 console at `http://localhost:8082/h2-console` with an empty password.
