# 🐍 Vydra JS CLI

> **Vydra JS CLI** is the official command-line interface for building ultra-fast SPA and Microfrontend applications using Web Components and the Vydra Framework.

[![Version](https://img.shields.io/badge/version-0.0.1--alpha-blue.svg)](https://github.com/vydra-js/vydra)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Quick Start

### Installation

Install Vydra CLI globally using your favorite package manager:

```bash
npm install -g @vydra-js/cli
# or
pnpm add -g @vydra-js/cli
```

### Create a New Project

Create a new microfrontend application or a root shell:

```bash
# Create a microfrontend app
vydra new app my-awesome-app

# Create a root shell (orchestrator)
vydra new root my-shell
```

---

## 🏗️ Project Architecture

Vydra distinguishes between two main project types:

### 📱 Microfrontend App (`app`)

A standalone application that can run in two modes:

- **SPA Mode**: Standard Single Page Application with its own `index.html`.
- **MFE Mode**: Build as a library/module to be consumed by a Root Shell.

### 🐚 Root Shell (`root`)

The orchestrator or "parent" application. It is responsible for:

- Loading and mounting microfrontends.
- Managing global state and event bus communication.
- Shared services like Authentication and Configuration.

---

## 🛠️ Commands Documentation

### `vydra new <type> <name> [prefix]`

Scaffolds a new Vydra project.

- **type**: `app` (microfrontend) or `root` (shell).
- **name**: Name of the project and directory.
- **prefix**: (Optional) Custom prefix for Web Components (default: `vydra`).

### `vydra generate` (alias: `g`)

Generates boilerplate for different entities using the project's design system.

```bash
# Generate a new page
vydra g page product-detail

# Generate a new component
vydra g component user-card
```

### `vydra app`

Commands specific to microfrontend applications.

```bash
# Start development server
vydra app serve

# Build for production
# Use --mode spa for a standalone app
# Use --mode mfe for a microfrontend module
vydra app build --mode [spa|mfe]

# Preview the production build
vydra app preview
```

### `vydra root`

Commands specific to the root shell/orchestrator.

```bash
# Start development server
vydra root serve

# Build for production
vydra root build

# Preview the production build
vydra root preview
```

---

## ⚙️ Configuration (`vydra.json`)

Every Vydra project contains a `vydra.json` file to manage its metadata and scaffolding behavior:

```json
{
  "vydra-cli": "0.0.1",
  "version": "1.0.0",
  "project": {
    "name": "my-app",
    "prefix": "vydra",
    "type": "app",
    "schematics": {
      "page": {
        "styles": true,
        "test": true
      },
      "component": {
        "styles": true,
        "test": true
      }
    }
  }
}
```

---

## 📦 Ecosystem

Vydra CLI is designed to work seamlessly with the Vydra core packages:

- **@vydra-js/core**: Core framework logic.
- **@vydra-js/router**: Lightning fast routing.
- **@vydra-js/bus**: Event-driven communication.
- **@vydra-js/forms**: Reactive forms for Web Components.
- **@vydra-js/i18n**: Multi-language support.

---

## 📄 License

MIT © [Vydra Team](https://github.com/vydra-js)
