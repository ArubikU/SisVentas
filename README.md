# SisVentas - Sales Management System

A modern, full-stack sales management system built with Next.js 15, React 18, and TypeScript. This application provides comprehensive tools for managing sales receipts, client deposits, products, and customers with multi-tier user authentication.

## 🚀 Features

- **📋 Receipt Management**: Create, view, edit, and search sales receipts
- **💰 Deposit Tracking**: Manage client deposits with currency conversion support (PEN/USD)
- **👥 Client Management**: Comprehensive client database with custom pricing
- **📦 Product Management**: Product catalog with customizable pricing
- **📊 Statistics Dashboard**: Visual analytics and reporting
- **👤 User Management**: Multi-tier access control (Basic, Advanced, Administrator)
- **🌐 Internationalization**: Support for English and Spanish
- **🎨 Modern UI**: Built with Radix UI components and Tailwind CSS
- **🌓 Dark Mode**: Built-in theme switching
- **🔒 Secure Authentication**: Role-based access control
- **💾 Flexible Database**: Support for JSON, MySQL, and Supabase

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF with autotable

### Backend
- **Runtime**: Node.js
- **Database Options**:
  - JSON (file-based, default)
  - MySQL
  - Supabase (PostgreSQL)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MySQL (optional, if using MySQL backend)
- Supabase account (optional, if using Supabase backend)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArubikU/SisVentas.git
   cd SisVentas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Database Type - Valid values: json, mysql, supabase
   DB_TYPE=json
   
   # MySQL Configuration (if using MySQL)
   MYSQL_HOST=localhost
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=sisventas
   
   # Supabase Configuration (if using Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   #### Option 1: JSON (Default - No setup required)
   The system will automatically create a `database.json` file when you first run the application.

   #### Option 2: MySQL
   Create the database and tables:
   ```sql
   CREATE DATABASE sisventas;
   USE sisventas;
   
   -- See database.md for complete table schemas
   ```

   #### Option 3: Supabase
   1. Create a new project in Supabase
   2. Run the SQL commands from `database.md` in the Supabase SQL editor
   3. Configure Row Level Security (RLS) policies as needed
   4. Add your Supabase URL and anon key to `.env.local`

   Refer to `database.md` for detailed table structures and requirements.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Other Scripts
```bash
# Run linter
npm run lint

# Watch Tailwind CSS
npm run tailwind
```

## 👥 User Roles and Permissions

The system supports three user tiers:

### Basic
- View and create receipts
- View own transactions

### Advanced
- All Basic permissions
- View and manage deposits
- Advanced reporting features

### Administrator
- All Advanced permissions
- Manage clients
- Manage products
- Manage users
- Full system access

## 🔑 Default Credentials

For testing purposes, use the following credentials:

**Email**: `admin@example.com`  
**Password**: `test1234`

> ⚠️ **Important**: Change these credentials in production!

## 📁 Project Structure

```
SisVentas/
├── app/
│   ├── api/              # API routes
│   │   ├── bills/        # Receipt endpoints
│   │   ├── clients/      # Client endpoints
│   │   ├── deposits/     # Deposit endpoints
│   │   ├── products/     # Product endpoints
│   │   └── usuarios/     # User endpoints
│   ├── bills/            # Receipt pages
│   ├── clients/          # Client pages
│   ├── components/       # Shared components
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── deposits/         # Deposit pages
│   ├── lib/              # Utilities and database implementations
│   │   └── db/           # Database abstraction layer
│   ├── login/            # Login page
│   ├── products/         # Product pages
│   ├── statistics/       # Statistics/Dashboard
│   ├── translations/     # i18n translations
│   └── usuarios/         # User management pages
├── components/           # UI components (shadcn/ui)
├── public/               # Static assets
└── database.md           # Database schema documentation
```

## 🗃️ Database Schema

The application uses the following main tables:

- **users**: Authentication and authorization
- **clients**: Client information and custom pricing
- **products**: Product catalog
- **bills**: Sales receipts with product details
- **deposits**: Client deposit records

For detailed schema information, see `database.md`.

## 🌐 Internationalization

The application supports multiple languages:
- English (en)
- Spanish (es)

Language can be switched from the user interface.

## 🎨 UI Components

Built with modern, accessible components:
- Forms with validation (React Hook Form + Zod)
- Data tables with sorting and filtering
- Modal dialogs and alerts
- Toast notifications
- Responsive design
- Dark mode support

## 🔒 Security Features

- Password hashing
- Session-based authentication
- Role-based access control (RBAC)
- API route protection
- Input validation
- XSS protection

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 🐛 Known Issues

- None reported at this time

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js and TypeScript**
