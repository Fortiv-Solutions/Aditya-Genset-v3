# Aditya Genset Website

A modern, interactive website for Aditya Genset showcasing diesel generators with 3D models, animations, and comprehensive product information..

## 🚀 Features

- **Interactive 3D Models** - View generator models in 3D using Three.js
- **Responsive Design** - Fully responsive across all devices
- **Modern UI** - Built with React, TypeScript, and Tailwind CSS
- **Component Library** - Shadcn/ui components for consistent design
- **Smooth Animations** - Framer Motion for engaging user experience
- **Product Catalog** - Comprehensive product listings and details
- **Dealer Network** - Interactive dealer network information

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** or **bun** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fortiv-Solutions/aditya-genset-v2.git
   cd aditya-genset-v2
   ```

2. **Install dependencies**
   
   Using npm:
   ```bash
   npm install
   ```
   
   Or using yarn:
   ```bash
   yarn install
   ```
   
   Or using bun:
   ```bash
   bun install
   ```

## 🏃 Running the Project

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Development Build

Create a development build:

```bash
npm run build:dev
```

## 🧪 Testing

Run tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🔍 Linting

Check code quality:

```bash
npm run lint
```

## 📁 Project Structure

```
aditya-genset-v2/
├── public/              # Static assets
│   ├── models/         # 3D model files (.glb)
│   └── ...
├── src/
│   ├── assets/         # Images and brand assets
│   ├── components/     # React components
│   │   ├── site/      # Site-specific components
│   │   └── ui/        # Reusable UI components
│   ├── data/          # Product data and configurations
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── test/          # Test files
├── index.html         # Entry HTML file
├── package.json       # Dependencies and scripts
└── vite.config.ts     # Vite configuration
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **Framer Motion** - Animation library
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **React Router** - Client-side routing
- **Vitest** - Testing framework

## 🌐 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## 📝 Environment Variables

Create a `.env` file in the root directory if needed for environment-specific configurations.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📧 Contact

For questions or support, please contact Fortiv Solutions.

---

Built with ❤️ by Fortiv Solutions
