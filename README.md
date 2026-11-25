# Inventory and Data Management System

**Assignment 3 – Web Dev III | Unit 3 | CO3**

A database-driven REST API for managing a store or warehouse product catalogue using Node.js, Express.js, MongoDB, Mongoose, and dotenv.

## Features
- Mongoose product schema with field-level validation
- Complete product CRUD operations
- Category and price filtering; search by name, SKU, or supplier
- Sorting and pagination
- Low-stock alert report
- Category-wise inventory aggregation
- Safe stock increments/decrements (restock and sale)
- Request logger and centralized error handling
- Environment configuration with dotenv

## Technology
Node.js, Express.js, MongoDB, Mongoose, dotenv, Postman.

## Project structure
```text
inventory-data-management-system/
├── config/db.js
├── controllers/productController.js
├── middleware/
│   ├── errorHandler.js
│   ├── logger.js
│   ├── notFound.js
│   └── validateProduct.js
├── models/Product.js
├── postman/Inventory_API.postman_collection.json
├── routes/productRoutes.js
├── scripts/seed.js
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── README.md
```

## Setup
Requirements: Node.js 18+, npm, and MongoDB Community Server or MongoDB Atlas.

1. Install packages:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` (PowerShell):
   ```powershell
   Copy-Item .env.example .env
   ```
3. Set your database URI in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/inventory_management
   ```
   For Atlas, use your own Atlas connection string. Never commit `.env`.
4. Ensure MongoDB is running.
5. Optional: load sample data:
   ```bash
   npm run seed
   ```
   **Warning:** the seed script deletes all documents in the selected `products` collection before inserting sample products. Use only with a practice database.
6. Start:
   ```bash
   npm start
   ```
   Server: `http://localhost:5000`  
   Health check: `GET http://localhost:5000/`

## Product schema
| Field | Type | Validation |
|---|---|---|
| name | String | Required, 2–100 chars |
| sku | String | Required, unique, uppercase, 3–30 valid chars |
| category | String | Required, max 60 chars |
| price | Number | Required, >= 0 |
| quantity | Number | Required, non-negative integer |
| reorderLevel | Number | Required, non-negative integer |
| supplier | String | Required, max 100 chars |

Mongoose timestamps add `createdAt` and `updatedAt`. The `stockValue` virtual calculates `price × quantity`.

## API endpoints
Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/` | Create product |
| GET | `/` | List, filter, sort, paginate |
| GET | `/:id` | Get product by ID |
| PUT | `/:id` | Update product |
| PATCH | `/:id/stock` | Adjust stock |
| DELETE | `/:id` | Delete product |
| GET | `/low-stock` | Low-stock report |
| GET | `/summary` | Category aggregation |

### Create product
`POST /api/products`
```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 48,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

### Filtering, sorting and pagination
Example:
`GET /api/products?category=Stationery&minPrice=50&maxPrice=200&sort=price&order=asc&page=1&limit=10`

Query parameters:
- `category`: exact category, case-insensitive
- `search`: product name, SKU, or supplier
- `minPrice`, `maxPrice`: price bounds
- `sort`: `name`, `price`, `quantity`, `category`, `createdAt`, `updatedAt`
- `order`: `asc` or `desc`
- `page`: page number, starts at 1
- `limit`: 1–100 records per page

### Get, update and delete
- `GET /api/products/PRODUCT_ID`
- `PUT /api/products/PRODUCT_ID` (send the product fields as JSON)
- `DELETE /api/products/PRODUCT_ID`

### Stock adjustment
`PATCH /api/products/PRODUCT_ID/stock`

Restock 10:
```json
{ "change": 10 }
```
Record sale of 3:
```json
{ "change": -3 }
```
A conditional MongoDB `$inc` operation prevents quantity from becoming negative. `change` must be a non-zero integer.

### Reports
- `GET /api/products/low-stock`: returns products where quantity is less than or equal to reorderLevel.
- `GET /api/products/summary`: aggregation groups by category and calculates totalItems, totalQuantity, totalStockValue, and avgPrice.

## HTTP status codes
| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Product created |
| 400 | Invalid input, ID, or query |
| 404 | Product or route not found |
| 409 | Duplicate SKU |
| 500 | Internal server error |

## Postman
1. Start MongoDB and the API.
2. Import `postman/Inventory_API.postman_collection.json`.
3. Set `baseUrl` to `http://localhost:5000`.
4. Create a product, copy its `_id`, and set the `productId` collection variable.
5. Test the remaining endpoints.

## Notes
- MongoDB provides persistent storage; records remain after the server restarts.
- `.env` is ignored by Git and must not be committed.
- No pre-built admin panel or CMS is included, as restricted by the assignment.

## Learning outcomes
Mongoose schema design and validation, Express REST CRUD, query-string filtering, sorting, pagination, aggregation pipelines, stock adjustment, middleware, centralized error handling, and dotenv configuration.

## Author
**Aditya Jha**  
B.Tech – Computer Science and Engineering  
K.R. Mangalam University

Course: Web Dev III | Assignment 3 | Unit 3 | CO3
