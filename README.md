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
- Persist inventory in a local H2 database.

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
