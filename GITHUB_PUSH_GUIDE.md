# GitHub Push Instructions

To push this code to GitHub, you need to authenticate. Follow these steps:

## Option 1: Using GitHub Personal Access Token (Recommended)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token
5. In PowerShell, run:
```powershell
cd D:\camacho
git config credential.helper store
git push -u origin main
# When prompted, use:
# Username: your-github-username
# Password: paste-the-token-you-copied
```

## Option 2: Using SSH Keys

1. Generate SSH key (if you don't have one):
```powershell
ssh-keygen -t rsa -b 4096 -f $env:USERPROFILE\.ssh\id_rsa
```

2. Add SSH key to GitHub:
   - Go to https://github.com/settings/ssh
   - Click "New SSH key"
   - Paste your public key from `~/.ssh/id_rsa.pub`

3. Update remote to use SSH:
```powershell
git remote set-url origin git@github.com:rainbowmole/n8n_copy.git
git push -u origin main
```

## Option 3: Using Git Credential Manager

Windows comes with Git Credential Manager. Just run:
```powershell
cd D:\camacho
git push -u origin main
# A login window will appear - use your GitHub credentials
```

---

## What Was Pushed

✅ **autoflow_v4_pan.html** - Main HTML file with all inline code
✅ **index.html** - Alternative entry point
✅ **README.md** - Complete project documentation
✅ **classes/** - Directory with modular JavaScript files:
   - NodeDefinition.js
   - WorkflowNode.js
   - WorkflowEdge.js
   - Workflow.js
   - WorkflowRenderer.js
   - WorkflowExecutor.js
   - ExecutionLogger.js
   - definitions.js
   - AutoflowApp.js

## Project Features

🎨 **Visual Workflow Builder**
- Drag & drop interface
- Pan & zoom canvas
- Real-time preview

🔧 **Node Types**
- Triggers: Manual, Scheduler, Webhook
- Actions: HTTP Request, Email, Script, Log
- Logic: If/Else, Delay, Merge
- Data: Set Variable, Transform, Filter

⚡ **Execution Engine**
- Simulates node operations
- Tracks execution state
- Detailed logging

📦 **Clean Architecture**
- 9 modular classes
- Single Responsibility Principle
- Easy to extend and maintain

---

## Running the Application

1. Open `autoflow_v4_pan.html` in a web browser
2. Click "Load Example" to see a sample workflow
3. Drag nodes from the left sidebar onto the canvas
4. Connect nodes by dragging ports
5. Configure nodes in the right panel
6. Click "Run" to execute the workflow
7. Watch execution progress in the log panel

---

## Development Notes

To add a new node type:
1. Edit `classes/definitions.js` - add NodeDefinition
2. Edit `classes/WorkflowExecutor.js` - add case in simExec()
3. Done! No other changes needed

To modify UI:
- Edit `classes/WorkflowRenderer.js`

To change execution logic:
- Edit `classes/WorkflowExecutor.js`

---

Made with ❤️ - May 11, 2026
