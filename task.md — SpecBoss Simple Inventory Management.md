# SpecBoss Simple Inventory Management

## 1. Project Goal

Build a simple inventory and sales management dashboard for SpecBoss.

The system should allow the admin to:

- Add/manage products
- Add stock
- Track stock by **State + Delivery Company**
- Add orders
- Automatically reduce stock when an order is successful
- View current stock
- View revenue
- View daily, weekly, monthly, and yearly sales
- See basic sales insights

The priority is to get a **working MVP up and running as quickly as possible**.

Do not over-engineer the application.

---

# 2. Tech Stack

Use:

- **Next.js** — App Router
- **TypeScript**
- **Tailwind CSS**
- **Firebase Authentication**
- **Firebase Firestore**
- **Firebase Storage** only if product images are needed
- **Recharts** for simple dashboard charts

There is no separate backend.

Firebase handles authentication and database operations.

---

# 3. Authentication

There is only **one user role: Admin**.

The admin should:

- Login with email/password
- Access the dashboard
- Manage products
- Manage stock
- Manage orders
- View reports

No staff roles or permission system is required.

Protect all dashboard routes from unauthenticated users.

---

# 4. Main Navigation

Create a simple sidebar:

```text
Dashboard

Products
Inventory
Orders

Delivery Companies
States

Reports
```

Keep the UI clean and minimal.

---

# 5. Products

The admin should be able to:

- Add product
- Edit product
- Activate/deactivate product
- View products

Product fields:

```text
id
name
sku
price
description
image
isActive
createdAt
updatedAt
```

Example:

```text
Product: SpecBoss Camera
SKU: SB-CAM-001
Price: ₦28,500
```

The product price should be used as the default price when creating an order.

---

# 6. States

Create a simple list of Nigerian states.

Example:

```text
Lagos
Osun
Oyo
Ogun
Ondo
Ekiti
Kwara
FCT
...
```

The admin should be able to select a state when adding stock or creating an order.

---

# 7. Delivery Companies

Replace "Company" with **Delivery Company** everywhere in the application.

Examples:

```text
GIG Logistics
GIGGO
Speedaf
Other delivery companies
```

Fields:

```text
id
name
isActive
createdAt
```

The admin should be able to add, edit, and deactivate delivery companies.

---

# 8. Inventory

Inventory is tracked by:

```text
Product
+
State
+
Delivery Company
```

Example:

```text
Product: SpecBoss Camera
State: Lagos
Delivery Company: GIG Logistics
Stock: 50
```

The admin should be able to add stock.

Stock record:

```text
id
productId
stateId
deliveryCompanyId
quantity
updatedAt
```

For the MVP, keep inventory simple.

When stock is added:

```text
Current Stock + Added Quantity
```

When a successful order is created:

```text
Current Stock - Order Quantity
```

Do not allow stock to become negative.

---

# 9. Add Stock

Create an "Add Stock" form:

```text
Product
State
Delivery Company
Quantity
```

Example:

```text
Product: Camera
State: Lagos
Delivery Company: GIG Logistics
Quantity: 50
```

After submission, update the corresponding inventory record.

If the product/state/delivery-company combination does not exist, create it.

---

# 10. Orders

The admin should be able to manually add orders.

Order fields:

```text
id
orderNumber
productId
stateId
deliveryCompanyId
quantity
salePrice
deliveryCost
customerName
customerPhone
customerAddress
status
orderDate
createdAt
updatedAt
```

Order statuses:

```text
Pending
Successful
Cancelled
```

Keep the status system simple.

---

# 11. Creating an Order

Order flow:

```text
Select Product
↓
Select State
↓
Select Delivery Company
↓
Show Available Stock
↓
Enter Quantity
↓
Sale Price automatically loads
↓
Enter Delivery Cost
↓
Customer details
↓
Select Status
↓
Save Order
```

Display:

```text
Available Stock: 20

Quantity: 2

Sale Price: ₦28,500

Subtotal: ₦57,000

Delivery Cost: ₦3,000

Total: ₦60,000
```

Calculate totals automatically.

---

# 12. Inventory + Order Logic

### Pending Order

Does not affect inventory or revenue.

### Successful Order

Reduce inventory immediately.

Example:

```text
Stock before: 50
Order: 3

Stock after: 47
```

Add the order revenue to reports.

### Cancelled Order

Does not count as revenue.

If a previously successful order is changed to cancelled, restore the quantity to inventory.

Make sure stock is not deducted/restored twice when an order status changes.

---

# 13. Order Number

Automatically generate a simple unique order number.

Example:

```text
SB-000001
SB-000002
SB-000003
```

---

# 14. Dashboard

Create a simple dashboard with four main cards:

```text
Today's Revenue
This Week
This Month
This Year
```

Also show:

```text
Total Orders
Units Sold
Current Stock
Low Stock Items
```

---

# 15. Revenue

Revenue should be calculated from **Successful orders only**.

Formula:

```text
Revenue = Quantity × Sale Price
```

Example:

```text
2 × ₦28,500 = ₦57,000
```

Delivery cost should be shown separately.

For example:

```text
Sales Revenue: ₦57,000
Delivery Cost: ₦3,000
Total Collected: ₦60,000
```

Do not include pending or cancelled orders in revenue.

---

# 16. Reports

Create a simple Reports page.

Allow the admin to view:

```text
Daily
Weekly
Monthly
Yearly
```

Show:

```text
Revenue
Orders
Units Sold
```

Add a simple chart showing revenue over time.

Use Recharts.

---

# 17. Sales by State

Show a simple table:

```text
State | Orders | Units Sold | Revenue
```

Example:

```text
Lagos | 25 | 40 | ₦1,140,000
Osun  | 10 | 15 | ₦427,500
Oyo   | 8  | 12 | ₦342,000
```

---

# 18. Sales by Delivery Company

Show:

```text
Delivery Company | Orders | Units Sold | Revenue
```

Example:

```text
GIG Logistics | 30 | 45 | ₦1,282,500
Speedaf       | 15 | 22 | ₦627,000
```

---

# 19. Inventory Page

Display:

```text
Product
State
Delivery Company
Available Stock
```

Example:

| Product | State | Delivery Company | Stock |
|---|---|---|---:|
| Camera | Lagos | GIG Logistics | 47 |
| Camera | Osun | Speedaf | 20 |

Add filters for:

```text
Product
State
Delivery Company
```

Highlight low-stock items.

Use a simple configurable threshold, e.g.:

```text
Low Stock = 5 or less
```

---

# 20. Firebase Firestore Structure

Keep the Firestore structure simple.

Use collections:

```text
users
products
states
deliveryCompanies
inventory
orders
```

Example:

```text
products/{productId}

states/{stateId}

deliveryCompanies/{deliveryCompanyId}

inventory/{inventoryId}

orders/{orderId}
```

An inventory document should contain:

```text
productId
stateId
deliveryCompanyId
quantity
updatedAt
```

An order document should contain:

```text
orderNumber
productId
stateId
deliveryCompanyId
quantity
salePrice
deliveryCost
subtotal
total
customerName
customerPhone
customerAddress
status
orderDate
createdAt
updatedAt
```

---

# 21. Firestore Data Integrity

When creating a successful order:

1. Read the relevant inventory.
2. Check that enough stock exists.
3. Reduce stock.
4. Create the order.
5. Perform the operation atomically using a Firestore transaction/batch where appropriate.

Never allow:

```text
stock < 0
```

---

# 22. Important Price Rule

When an order is created, save the current product price directly on the order as:

```text
salePrice
```

Do not calculate old order revenue using the product's current price.

Example:

```text
Product current price: ₦30,000

Old order:
salePrice = ₦28,500
```

The old order must continue using:

```text
₦28,500
```

---

# 23. Dashboard Date Calculations

Use the order's `orderDate`.

Calculate:

```text
Today's Revenue
This Week's Revenue
This Month's Revenue
This Year's Revenue
```

Only include:

```text
status === "successful"
```

---

# 24. Search & Filters

Implement basic filtering/search for:

### Orders

```text
Order Number
Customer
Product
State
Delivery Company
Status
Date
```

### Inventory

```text
Product
State
Delivery Company
```

Do not build complex search infrastructure for the MVP.

---

# 25. UI Requirements

Use:

- Next.js
- Tailwind CSS
- Responsive layout
- Simple admin dashboard
- Clean tables
- Simple forms
- Confirmation dialogs for destructive actions
- Toast notifications for successful/failed actions

Desktop and mobile should both work.

Avoid unnecessary animations and complicated UI.

---

# 26. MVP Pages

Build only these pages:

```text
/login

/dashboard

/products
/products/new
/products/[id]

/inventory

/orders
/orders/new
/orders/[id]

/delivery-companies

/states

/reports
```

---

# 27. Development Order

Build in this order:

## Step 1

Set up:

```text
Next.js
TypeScript
Tailwind
Firebase
Authentication
```

## Step 2

Build:

```text
Admin login
Dashboard layout
Sidebar
```

## Step 3

Build:

```text
Products
States
Delivery Companies
```

## Step 4

Build:

```text
Inventory
Add Stock
Stock filtering
```

## Step 5

Build:

```text
Orders
Order creation
Order status
Automatic inventory deduction
```

## Step 6

Build:

```text
Dashboard metrics
Revenue calculations
```

## Step 7

Build:

```text
Reports
Charts
Sales by State
Sales by Delivery Company
```

## Step 8

Test the complete flow.

---

# 28. Critical Test Flow

The following must work correctly:

```text
Admin Login
↓
Create Product
↓
Add Delivery Company
↓
Select State
↓
Add 50 units of stock
↓
Create Successful Order for 3 units
↓
Stock becomes 47
↓
Revenue increases by sale amount
↓
Create Pending Order
↓
Stock remains 47
↓
Mark Pending Order as Successful
↓
Stock decreases
↓
Cancel successful order
↓
Stock is restored
↓
Revenue is updated correctly
```

---

# 29. MVP Definition of Done

The MVP is complete when the admin can:

- Login
- Add products
- Add states
- Add delivery companies
- Add stock
- See available stock
- Create orders
- Mark orders successful/cancelled/pending
- Automatically deduct successful orders from stock
- Restore stock when appropriate
- View daily revenue
- View weekly revenue
- View monthly revenue
- View yearly revenue
- View sales by state
- View sales by delivery company
- View basic charts
- Search/filter orders
- Search/filter inventory

---

# 30. Keep It Simple

This is an MVP.

Do NOT implement:

- Multiple user roles
- Complex permissions
- Suppliers
- Purchase orders
- Accounting
- Payroll
- Customer accounts
- Payment gateway
- SMS
- WhatsApp automation
- Email automation
- Multi-warehouse architecture
- Complex audit systems
- Advanced profit/loss accounting

Build the simplest reliable system that can be used by the admin immediately.

**Priority: working inventory + orders + revenue dashboard first.**