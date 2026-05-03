# LogiTrack TMS – Transport Management System

A full-featured **Logistics & Transport Management System** built as a React capstone project.

## 📦 Features

### 1. Dashboard
- Live stats: Today's LRs, Total Freight, Pending shipments, Customer count
- 7-day freight trend chart (Recharts AreaChart)
- Today's cashflow summary from Daybook
- Recent LR receipts quick-view table

### 2. LR Receipt (Lorry Receipt)
- Create / Edit / Delete LR Receipts
- Auto-generated LR numbers
- Full form: Consignor, Consignee, Route, Vehicle, Goods, Freight calculation
- Auto-computes Grand Total (Freight + Hamali + Cartage + Other)
- Status management: Pending → In Transit → Delivered → Cancelled
- **Print / PDF** — Professional printable LR document with company letterhead, table, signatures
- Search & filter by status

### 3. Daybook
- Daily income & expense entries
- Categories: Fuel, Driver Salary, Vehicle Repair, Freight Income, etc.
- Running balance with daily totals
- Payment modes: Cash, Bank, UPI, Cheque, NEFT, RTGS
- Date filtering + type filtering

### 4. Customer Management
- Consignors, Consignees, or Both
- Full profile: GST, PAN, address, credit limit, outstanding
- Search by name, phone, city, GST
- Customer detail view popup
- Active / Inactive status

### 5. Settings
- Company profile (name, address, GST, PAN, contact)
- LR configuration (prefix, start number, payment mode default)
- Terms & Conditions (printed on every LR)
- Route management with base rates
- Fleet/Vehicle management with driver details

## 🛠 Tech Stack (Capstone-Compliant)
- **Frontend**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **API/Fetch**: Axios (ready for integration)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Print**: react-to-print
- **Deployment Ready**: Vercel / Netlify

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 📁 Project Structure

```
src/
  components/
    layout/        # Sidebar Layout
  pages/
    Dashboard/     # Overview & charts
    LRReceipt/     # LR form, list, print view
    Daybook/       # Income/expense entries
    Customers/     # Party management
    Settings/      # App configuration
  store/
    slices/        # Redux slices for each module
  index.css        # Global styles with Tailwind
```

## 🌐 Deployment

```bash
npm run build
# Deploy dist/ folder to Vercel or Netlify
```
