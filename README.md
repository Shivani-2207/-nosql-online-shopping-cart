# Shopping Cart & Session Management (Cassandra + MongoDB)

| Data | Store | Why |
|---|---|---|
| Sessions | Cassandra | Key lookup, auto-expiry via TTL, high write rate |
| Cart items | Cassandra | One partition per cart, TTL, fast overwrite |
| Products, Users, Orders | MongoDB | Flexible documents, text search, durable |

## Setup
1. `docker compose up -d`            (wait ~60s for Cassandra to be healthy)
2. `cp .env.example .env`
3. `npm install`
4. `npm run init:db`                 (creates keyspace + tables)
5. `npm run seed`                    (prints product IDs)
6. `npm start`

## Try it (cookie jar keeps your session)
```bash
curl -c jar -b jar localhost:3000/api/products
curl -c jar -b jar -X POST localhost:3000/api/cart/items -H 'Content-Type: application/json' -d '{"productId":"<ID>","quantity":2}'
curl -c jar -b jar localhost:3000/api/cart
curl -c jar -b jar -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"password123","name":"Asha"}'
curl -c jar -b jar localhost:3000/api/cart     # anonymous cart was merged
curl -c jar -b jar -X POST localhost:3000/api/orders/checkout -H 'Content-Type: application/json' -d '{"address":{"line1":"1 Main St","city":"Hyderabad","state":"TS","pincode":"500001"}}'
```

## API
POST /api/auth/register | login | logout, GET /api/auth/me
GET /api/products, GET /api/products/:id
GET /api/cart, POST /api/cart/items, PATCH|DELETE /api/cart/items/:productId, DELETE /api/cart
POST /api/orders/checkout, GET /api/orders

## Inspect data
docker exec -it shop-cassandra cqlsh -e "SELECT * FROM shop.sessions; SELECT * FROM shop.cart_items;"
docker exec -it shop-mongo mongosh shop --eval "db.orders.find()"
