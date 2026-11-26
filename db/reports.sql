-- Raw SQL the merchant/admin can run for insights (Week 9).
-- Prisma handles the day-to-day queries; these show you can also think in plain SQL + JOINs.

-- 1) Best-selling products (by units sold), with their category.
SELECT p.title,
       c.name                AS category,
       SUM(oi.qty)           AS units_sold,
       SUM(oi.qty * oi."priceCents") / 100.0 AS revenue_usd
FROM "OrderItem" oi
JOIN "Product"  p ON oi."productId" = p.id
JOIN "Category" c ON p."categoryId" = c.id
GROUP BY p.title, c.name
ORDER BY units_sold DESC
LIMIT 10;

-- 2) Revenue per shop.
SELECT s.name AS shop,
       SUM(oi.qty * oi."priceCents") / 100.0 AS revenue_usd
FROM "OrderItem" oi
JOIN "Product" p ON oi."productId" = p.id
JOIN "Shop"    s ON p."shopId"     = s.id
GROUP BY s.name
ORDER BY revenue_usd DESC;

-- 3) Products running low on stock (re-order list).
SELECT title, stock
FROM "Product"
WHERE stock < 5
ORDER BY stock ASC;

-- 4) How many orders each customer has placed.
SELECT u.name, u.email, COUNT(o.id) AS orders, SUM(o."totalCents") / 100.0 AS spent_usd
FROM "User" u
LEFT JOIN "Order" o ON o."customerId" = u.id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.name, u.email
ORDER BY spent_usd DESC NULLS LAST;
