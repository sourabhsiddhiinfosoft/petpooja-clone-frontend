# Owner User Manual – First-Time Setup and Daily Use

This guide walks an Owner through setting up the restaurant the first time and performing daily CRUD operations.

## Before You Start
- Make sure you have your Owner account credentials
- Recommended: Prepare your menu, categories, and table names beforehand

---

## 1) Log In
- Go to Login
- Enter your email and password
- You’ll land on the Owner Dashboard (`/owner/dashboard`)

---

## 2) Create Branches
Path: `Owner → Branches` (`/owner/branches`)

- Click “Add Branch”
- Fill details: Branch Name, Address, City/State/Country, Contact
- Click “Save”
- To edit: click “Edit” on any branch
- To deactivate/activate: toggle Active status

Tip: If you have one location only, you still create a single branch.

---

## 3) Define Areas (Sections) in a Branch
Path: `Owner → Areas` (`/owner/areas`)

- Select your Branch if prompted
- Click “Add Area” (e.g., Ground Floor, Terrace, AC Hall)
- Enter Area Name and save
- Edit/Delete areas as needed

---

## 4) Add Tables
Path: `Owner → Tables` (`/owner/tables`)

- Select Branch and Area
- Click “Add Table”
- Provide Table Name/Number and capacity (optional)
- Save
- Repeat for all tables
- Edit/Delete tables if needed

---

## 5) Create Menu Categories
Path: `Owner → Categories` (`/owner/categories`)

- Click “Add Category” (e.g., Starters, Main Course, Beverages, Desserts)
- Enter Category Name and (optional) description
- Save
- Reorder categories if supported (optional)

---

## 6) Add Menu Items
Path: `Owner → Menu Items` (`/owner/menu-items`)

- Click “Add Item”
- Fill fields:
  - Name (e.g., Margherita Pizza)
  - Category (select from categories created above)
  - Price
  - Veg/Non-Veg (if applicable)
  - Description and Addons/Variants (if applicable)
- Save
- Edit/Delete items as needed

Note: Items added here are selectable in ordering and used to generate KOT.

---

## 7) Inventory (Optional but Recommended)
Path: `Owner → Inventory` (`/owner/inventory`)

- Add ingredients/goods with stock levels and unit
- Update stock in/out based on purchases/consumption
- Configure low stock alerts (if supported)

Tip: Keep item names consistent with what the kitchen uses.

---

## 8) Add Staff and Assign Roles
Path: `Owner → Staff` (`/owner/staff`)

- Click “Add Staff”
- Enter Name, Phone/Email, and set Role:
  - Waiter: takes orders from tables
  - Chef: updates KOT status in the kitchen
  - Cashier/Manager (if applicable)
- Assign Branch (and Area if applicable)
- Save; share login credentials with staff
- Edit/Deactivate users as needed

---

## 9) Take Orders (Dine-in / POS)
Path: `Owner → Take Order` (`/owner/takeOrder`) or `Owner → POS` (`/owner/pos`)

Steps:
1) Select Branch, Area, and Table
2) Search and add Menu Items (quantity, addons/notes)
3) Review cart and place the Order
   - This generates a KOT (Kitchen Order Ticket)

Real-time: Chefs see new KOT instantly; Waiters/Owners see KOT status updates.

---

## 10) KOT and Kitchen Flow
Chef Path: `Chef → Running KOTs` (`/chef/runningKOTs`)

- Chef views incoming KOTs in real time
- Update status: Pending → Preparing → Ready
- When marked Ready, Waiter/Owner gets a notification

Waiter Path: `Waiter → Running KOTs` (`/waiter/runningKOTs`)

- Waiter monitors tables and KOT statuses
- When Ready, serve items; optionally print KOT

Owner Path: `Owner → Orders` (`/owner/orders`)

- Monitor all orders and KOT statuses
- Filter/search by order/table
- Update order if required

---

## CRUD Quick Reference

- Branches: Create/Edit/Delete branches at `Owner → Branches`
- Areas: Create/Edit/Delete areas at `Owner → Areas`
- Tables: Create/Edit/Delete tables at `Owner → Tables`
- Categories: Create/Edit/Delete categories at `Owner → Categories`
- Menu Items: Create/Edit/Delete items at `Owner → Menu Items`
- Inventory: Add/Update stock at `Owner → Inventory`
- Staff: Add/Edit/Deactivate staff at `Owner → Staff`

---

## Best Practices
- Create Branch → Areas → Tables first (seating map foundation)
- Then Categories → Menu Items (ordering foundation)
- Add Staff and share credentials before service hours
- Use Inventory to track costs and avoid out-of-stock surprises
- Use search and filters on KOT/Orders pages during rush hours

---

## Real-time Notifications (FYI)
- KOT Created → Chefs get instant notification
- KOT Status Updated (Preparing/Ready) → Waiters/Owners get instant notification
- Ensure you are logged in with correct role and branch

---

## Troubleshooting
- Not seeing data?
  - Confirm correct Branch selected
  - Refresh the page
  - Check your role and login status
- Menu item missing?
  - Make sure Category exists and item is Active
- KOT/Order not updating?
  - Check network and login
  - Ensure Chef updates KOT status

---

## Need Help?
Contact your admin or support. Keep your branch, table, and order IDs handy for faster assistance.
