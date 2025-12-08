# React + Vite + JQL Editor

A modern React application built with Vite and integrated with Atlassian JQL Editor - the official Jira Query Language editor from Atlassian Labs.

## 🚀 Features

- ⚡ **Vite** - Lightning fast build tool and dev server
- ⚛️ **React 19** - Latest React with TypeScript
- 📝 **JQL Editor** - Official Atlassian JQL Editor with:
  - Autocomplete for fields, values, and functions
  - Syntax validation
  - Custom syntax highlighting:
    - Fields: Blue
    - Strings: Orange
    - Numbers: Green
    - Functions: Yellow
    - Operators (AND, OR, NOT): Gray
  - Built-in search functionality
  - Support for standard Jira Query Language

## 📋 Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

## 🎯 Usage

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
react-vite/
├── src/
│   ├── components/
│   │   └── JQLEditorComponent.tsx    # JQL Editor component
│   ├── App.tsx                       # Main app component
│   ├── App.css                       # App styles
│   ├── index.css                     # Global styles
│   └── main.tsx                      # Entry point
├── public/                           # Static assets
├── vite.config.ts                    # Vite configuration
└── package.json                      # Dependencies
```

## 🎨 JQL Syntax Examples

### Basic Queries
- `project = "TEST"` - Find issues in TEST project
- `status = "To Do"` - Find issues with "To Do" status
- `assignee = currentUser()` - Find issues assigned to current user

### Complex Queries
- `project = "TEST" AND status IN ("To Do", "In Progress")`
- `created >= -7d AND priority = High`
- `summary ~ "bug" OR description ~ "error"`
- `project = "TEST" AND (status = "Done" OR resolution = "Fixed")`

## 📚 Usage Example

```typescript
import JQLEditorComponent from './components/JQLEditorComponent';

function MyComponent() {
  const [jql, setJql] = useState('project = "TEST"');

  const handleSearch = (jql: string) => {
    console.log('JQL Query:', jql);
  };

  return (
    <JQLEditorComponent
      value={jql}
      onChange={setJql}
      onSearch={handleSearch}
      analyticsSource="my-app"
    />
  );
}
```

## ⚙️ Configuration

### Vite Config

The Vite configuration includes:
- Emotion library alias for compatibility
- Dependency optimization for JQL Editor
- Global variable definitions for Node.js compatibility

## 📚 Resources

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [@atlassianlabs/jql-editor](https://www.npmjs.com/package/@atlassianlabs/jql-editor)
- [Jira Query Language (JQL) Documentation](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT
