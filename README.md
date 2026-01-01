# Weavy Clone - Visual AI Workflow Builder

A production-quality visual AI workflow builder similar to Weavy.ai, built with Next.js, React Flow, and Google Gemini. Create complex LLM workflows by visually connecting nodes on a canvas.

## Features

- 🎨 **Visual Workflow Builder** - Drag and drop nodes to create workflows
- 🤖 **LLM Integration** - Connect text and image inputs to Google Gemini
- 📝 **Text Nodes** - Input text for system prompts and user messages
- 🖼️ **Image Nodes** - Upload or paste images for multimodal AI prompts
- 🔗 **Node Connections** - Connect nodes to build complex workflows
- 💾 **Workflow Persistence** - Save and load workflows from localStorage
- 📤 **Export/Import** - Export workflows as JSON files
- ⌨️ **Keyboard Shortcuts** - Delete nodes, save workflows with keyboard
- 🗺️ **Minimap** - Navigate large workflows easily
- 🎯 **Zoom & Pan** - Smooth canvas navigation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

3. Add your Google Gemini API key to `.env.local`:

```
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and click "Open Workflow Builder"

## Usage

### Creating a Workflow

1. **Add Nodes**: Click on "Text Node", "Image Node", or "LLM Node" in the sidebar to add them to the canvas
2. **Connect Nodes**: Drag from the output handle (right side) of a node to an input handle (left side) of the LLM Node
3. **Configure Nodes**:
   - **Text Node**: Enter text in the textarea
   - **Image Node**: Click to upload or paste an image
   - **LLM Node**: Connect text nodes to `system_prompt` (optional) and `user_message` (required), and image nodes to `images` (optional)
4. **Run Workflow**: Click "Run Workflow" on the LLM Node to execute

### Node Types

#### Text Node
- Stores user-entered text
- Can be connected to LLM Node's `system_prompt` or `user_message` inputs
- Has one output handle

#### Image Node
- Accepts image uploads (click or paste)
- Stores image as base64
- Can be connected to LLM Node's `images` input
- Has one output handle

#### LLM Node
- **Inputs**:
  - `system_prompt` (optional) - System instructions from Text Node
  - `user_message` (required) - User message from Text Node
  - `images` (optional) - Images from Image Nodes
- **Output**: AI-generated text response
- Shows loading state while processing
- Displays errors if validation fails

### Keyboard Shortcuts

- `Delete` or `Backspace` - Delete selected nodes
- `Cmd/Ctrl + S` - Save workflow

### Saving Workflows

- Workflows are automatically saved to localStorage
- Use "Export" to download workflow as JSON
- Use "Import" to load a previously exported workflow
- Use "Clear" to reset the canvas

## Project Structure

```
src/
  app/
    workflow/
      page.tsx          # Main workflow page
    api/
      llm/
        route.ts        # Gemini API route
    layout.tsx          # Root layout
    page.tsx            # Home page
  components/
    sidebar/
      Sidebar.tsx       # Left sidebar with node buttons
    canvas/
      WorkflowCanvas.tsx # React Flow canvas
    nodes/
      TextNode.tsx      # Text input node
      ImageNode.tsx     # Image input node
      LLMNode.tsx       # LLM processing node
  lib/
    types.ts            # TypeScript type definitions
    validation.ts       # Zod validation schemas
    llm.ts              # Gemini API client
    workflow-storage.ts # localStorage persistence
```

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Flow** - Node-based workflow canvas
- **Google Generative AI** - Gemini API integration
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **ESLint** - Code linting

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key (required)

## License

ISC

