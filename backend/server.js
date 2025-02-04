const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Allow CORS for frontend requests
app.use(cors());

// Serve models from the "models" directory
const modelsDir = path.join(__dirname, 'models');
app.use('/models', express.static(modelsDir));

// RESTful API to fetch available models
app.get('/api/models', (req, res) => {
    const models = [
        { name: 'Example GLB', url: '/models/trailer_glb/scene.glb' },
        { name: 'Example OBJ', url: '/models/r2-d2/r2-d2.obj' },
        { name: 'Example GLTF', url: '/models/trailer_gltf/scene.gltf' },
    ];
    res.json(models);
});

// Start the server
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
