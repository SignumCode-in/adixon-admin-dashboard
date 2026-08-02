# Adixon Admin Panel - Frontend Dashboard

A modern, high-performance, and responsive Electronic Medical Record (EMR) and Clinic Management Dashboard built with **React**, **Vite**, **Lucide Icons**, and **Vanilla CSS**.

---

## 🌟 Key Features

- **📊 Comprehensive Analytics Dashboard**
  - Live revenue metrics, patient growth, appointment statistics, and interactive Chart.js visualizations.
- **🖥️ Full Page Screen Editors (100% Width)**
  - Seamless full-screen creation and editing interface for Patients, Appointments, Prescriptions, Medicines, Labs, Certificates, Instructions, Consents, Users, Clinics, and Templates.
- **🛡️ Custom UI Deletion Modal (`ConfirmDeleteModal`)**
  - Replaced browser-native alerts with custom, accessible confirmation dialog popups featuring warning icons and safety prompts.
- **📂 Assets & Forms Suite**
  - Fully integrated modules for Medicines Catalog, Lab Orders, Sick Leave & Fitness Certificates, Patient Recovery Instructions, Legal Consents, and Prescription Templates.
- **👥 Users & Staff Directory**
  - Manage practitioner profiles, staff accounts, roles (Administrator, Doctor, Receptionist, Staff), active/suspended statuses, and bulk operations.
- **🏥 Clinic & Branch Management**
  - Multi-clinic management with customizable header options for printed prescriptions and certificates (Logo, Stamp, Doctor Signature, Open Days, Visiting Hours).
- **⚙️ Integrated General Settings**
  - Real backend API integrations for Doctor/Staff Profile, Clinic Practice Configurations, and Account Password Security.
- **🔐 Secure Authentication & Utility UI**
  - JWT token authentication, login password visibility toggle (Eye icon), OTP password reset flow, and persistent Dark/Light theme switching.

---

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: Pure Vanilla CSS with custom Design Tokens & Theme Variables

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have **Node.js** (v16.0 or higher) and **npm** installed on your system.

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `frontend` root directory if connecting to a custom backend host:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Development Server

Start the local Vite development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

To compile and optimize the application for production:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

---

## 📁 Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/             # Static assets & images
│   ├── components/         # Reusable UI components (Sidebar, Topbar, ConfirmDeleteModal, etc.)
│   ├── context/            # Global Auth & Theme Context providers
│   ├── pages/              # Main route pages (Dashboard, Patients, Appointments, Prescriptions, etc.)
│   ├── services/           # Axios API configuration & endpoints
│   ├── index.css           # Global design system & theme variables
│   ├── App.jsx             # Route definitions & app entry layout
│   └── main.jsx            # React root DOM renderer
├── index.html              # HTML5 entry template
├── package.json            # Project dependencies & scripts
├── vite.config.js          # Vite build options
└── README.md               # Project documentation
```

---

## 📄 License

This project is proprietary and confidential. Authorized usage only under agreement.
