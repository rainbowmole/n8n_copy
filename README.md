# Autoflow - Modular Architecture

This project has been refactored into a clean, modular OOP architecture with separated concerns.

## Project Structure

```
d:\camacho\
├── autoflow_v4_pan.html          (Main HTML file)
├── index.html                      (Alternative entry point)
└── classes/                        (Modular classes)
    ├── NodeDefinition.js           (Node type metadata)
    ├── WorkflowNode.js             (Individual node instance)
    ├── WorkflowEdge.js             (Connection between nodes)
    ├── Workflow.js                 (Core state & logic)
    ├── WorkflowRenderer.js         (UI rendering & canvas)
    ├── WorkflowExecutor.js         (Workflow execution engine)
    ├── ExecutionLogger.js          (Execution logging)
    ├── definitions.js              (Node definitions registry)
    └── AutoflowApp.js              (Main application orchestrator)
```

## Class Responsibilities

### `NodeDefinition`
- Metadata for node types (label, color, icon, description)
- Field definitions for configuration

### `WorkflowNode`
- Individual node instance with position, type, config
- State management (idle, running, success, error)
- Config summary generation

### `WorkflowEdge`
- Represents connections between nodes
- Stores source and destination node IDs

### `Workflow`
- Core business logic and state management
- Node/edge CRUD operations
- Variable tracking for execution
- Selection state

### `WorkflowRenderer`
- All UI rendering (nodes, edges, canvas)
- Pan/zoom controls
- Canvas transformation and drawing
- Config panel updates
- Event delegation for mouse/drag operations

### `WorkflowExecutor`
- Executes workflow logic
- Simulates node operations (HTTP, email, script, etc.)
- Manages execution flow
- Integrates with logger

### `ExecutionLogger`
- Logs execution events with timestamps
- Renders logs to UI
- Maintains log history

### `definitions.js`
- Registry of all available node types
- Centralized configuration

### `AutoflowApp`
- Main application orchestrator
- Coordinates all components
- Manages user interactions
- Public API for external calls

## Loading Order

Scripts are loaded in dependency order in `autoflow_v4_pan.html`:
1. `NodeDefinition.js` - Basic data structure
2. `WorkflowNode.js` - Depends on NodeDefinition
3. `WorkflowEdge.js` - Simple structure
4. `Workflow.js` - Uses WorkflowNode & WorkflowEdge
5. `WorkflowRenderer.js` - Uses Workflow
6. `WorkflowExecutor.js` - Uses Workflow
7. `ExecutionLogger.js` - Uses definitions
8. `definitions.js` - Node definitions
9. `AutoflowApp.js` - Uses all above classes

## Usage

The app creates a global `app` instance automatically:

```javascript
app.loadExample()           // Load example workflow
app.clearAll()              // Clear all nodes and edges
app.runWorkflow()           // Execute the workflow
app.deleteNode(id)          // Delete a specific node
app.updateNodeConfig(id, k, v)  // Update node configuration
```

## Benefits

✅ **Modularity** - Each file has a single responsibility  
✅ **Maintainability** - Changes are isolated to specific classes  
✅ **Scalability** - Easy to add new node types or features  
✅ **Testability** - Classes can be tested independently  
✅ **Readability** - Clear structure and separation of concerns  

## Development

To add a new node type:
1. Add definition to `definitions.js`
2. Add execution logic to `WorkflowExecutor.simExec()`
3. No other files need modification

To modify rendering:
- Edit `WorkflowRenderer.js` only

To change execution behavior:
- Edit `WorkflowExecutor.js` only

To add logging:
- Edit `ExecutionLogger.js` only
