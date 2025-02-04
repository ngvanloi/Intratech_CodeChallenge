# Three.js Model Viewer

This project is a 3D model viewer built using Three.js. It supports loading and interacting with GLTF/GLB and OBJ models. Users can select models from a GUI, adjust their colors, and view them with interactive controls.

## Features
- Load 3D models dynamically from an API.
- Interactive controls using OrbitControls.
- Real-time color adjustment for models.
- Display model loading progress.
- Configurable lighting and ground plane for enhanced visuals.
- Performance monitoring with `Stats.js`.

## Setup

### Prerequisites
- Node.js and npm installed.
- A server running at `http://localhost:3000` to provide the models API.

### Installation
1. Clone this repository:

   ```bash
   git clone https://github.com/ngvanloi/Intratech_CodeChallenge.git
   cd Intratech_CodeChallenge
   ```
   
2. Install dependencies and start a local server to host the project or use a development server.
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Start a live server to view the project:
   - Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for Visual Studio Code if you don't have it.
   - Open the project folder in Visual Studio Code.
   - In the file explorer, navigate to the `frontend` folder and right-click on `index.html`.
   - Select **"Open with Live Server"** to launch the project in your browser.

## Usage

### Local API
Ensure the server at `http://localhost:3000` provides an endpoint `/api/models` that returns a list of models in the following format:
```json
[
  { "name": "ModelName", "url": "/path/to/model.gltf" },
  { "name": "AnotherModel", "url": "/path/to/model.obj" }
]
```

## File Structure

```
Intratech_CodeChallenge/
├── backend/
│   ├── models/            # Folder for storing models and other assets
│   └── server.js          # Main server file
├── frontend/
│   ├── index.html         # Entry point for the frontend application
│   ├── index.css          # Basic styling for the viewer
│   └── main.js            # Main JavaScript file for frontend logic
```

## Functions Overview

### Initialization
- **`createCamera()`**: Sets up the perspective camera.
- **`createRenderer()`**: Initializes the WebGL renderer with antialiasing and shadows.
- **`setupControls()`**: Configures OrbitControls for camera interaction.
- **`addGround()`**: Adds a ground plane to the scene.
- **`addLighting()`**: Adds a spotlight to illuminate the scene.

### Model Management
- **`fetchModels()`**: Fetches the list of models from the API.
- **`createGUI(models)`**: Creates a GUI for selecting models and colors.
- **`loadModel(url)`**: Loads the selected model into the scene.
- **`resetScene()`**: Clears the previous model from the scene.

### Event Handling
- **`handleModelSelection(value, modelMap)`**: Handles model selection from the GUI.
- **`updateModelColor(value)`**: Updates the color of the selected model.
- **`handleWindowResize()`**: Adjusts the renderer and camera on window resize.

### Animation
- **`animate()`**: Main render loop for the scene, updating controls and stats.

### OBJ and GLTF Model Loading
- **`loadGLTFModel(url)`**: Loads a GLTF/GLB model and handles progress and errors.
- **`loadOBJModel(objPath)`**: Handles loading of OBJ models with or without MTL files.
- **`loadOBJWithMaterial(objPath, mtlPath)`**: Loads an OBJ model with materials if an MTL file exists.
- **`loadObjWithoutMaterial(objPath)`**: Loads an OBJ model without materials if no MTL file exists.

## Notes
- Ensure models are correctly formatted and hosted at the API endpoint.
- The GUI includes options for model selection, color adjustment, and lighting customization.
- Use the Stats panel to monitor performance during development.