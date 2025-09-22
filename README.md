# Modern CRM Frontend

A sophisticated Customer Relationship Management frontend application built with Next.js 15 and TypeScript, featuring AI-powered campaign generation and advanced customer segmentation.

## Key Features

### **Dashboard & Analytics**

- Real-time customer metrics and engagement tracking
- Interactive charts with Recharts integration
- Growth statistics and performance indicators

### **Customer Management**

- Complete CRUD operations for customer data
- Order tracking and purchase history
- Smart customer insights and analytics

### **Advanced Segmentation**

- Dynamic customer segmentation with complex conditions
- Visual segment builder with AND/OR logic
- Real-time audience size calculation

### **AI-Powered Campaigns**

- Google Gemini AI integration for message generation
- Targeted campaign creation with segment selection
- Campaign history and performance tracking

### **Authentication & Security**

- Google OAuth integration (with Passport.js)
- Protected routes with role-based access
- Secure session management

## Technical Stack

### **Frontend Framework**

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Turbopack** for optimized builds

### **UI/UX Design**

- **Tailwind CSS** with custom design system
- **Shadcn/UI** component library
- **Lucide React** icons
- **Geist & Playfair Display** fonts

### **State Management & Forms**

- **React Hook Form** with Zod validation
- **Sonner** for toast notifications

### **AI Integration**

- **Google Gemini AI** for content generation
- Custom API routes for AI processing
- Intelligent campaign message suggestions

## Architecture

### **Component Structure**

```text
components/
├── auth/           # Authentication components
├── campaigns/      # Campaign management
├── customers/      # Customer operations
├── segments/       # Segmentation builder
├── orders/         # Order management
├── layout/         # App layout & navigation
└── ui/            # Reusable UI components
```

### **App Router Structure**

```text
app/
├── api/           # API routes (AI integration)
├── auth/          # Authentication pages
├── campaigns/     # Campaign management
├── customers/     # Customer management
├── segments/      # Segmentation interface
└── orders/        # Order tracking
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yuvinraja/crm-frontend.git
   cd crm-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=your_backend_api_url
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open application**

   Navigate to [http://localhost:3001](http://localhost:3001)

## Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Design System

- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Dark/Light Mode**: Theme provider with system preference detection
- **Accessibility**: WCAG compliant with Radix UI primitives
- **Component Library**: Consistent design tokens and reusable components

## Integration

This frontend is designed to work with a REST API backend featuring:

- Customer and order management endpoints
- Segment creation and audience calculation
- Campaign execution and tracking
- Authentication and user management
