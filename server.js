require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// Eliminado bodyParser, usamos express.json()
const jwt = require('jsonwebtoken');
const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(express.json());
app.use(cors());
// Servir archivos estáticos del frontend
app.use(express.static('public'));
// Middleware de logging avanzado
app.use(morgan('combined'));

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Middleware SOLO para rutas de tareas
app.use('/api/tasks', (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token no proporcionado');
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).send('Token inválido');
    req.userId = decoded.userId;
    next();
  });
});

// Rutas de tareas
app.use('/api/tasks', taskRoutes);

// Conexión a MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/BaseCrud';
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Conectado a la base de datos MongoDB');
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });

// Manejo de errores de validación de MongoDB
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    res.status(400).send('Error de validación: ' + err.message);
  } else {
    next(err);
  }
});

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tareas',
      version: '1.0.0',
      description: 'Documentación de la API para la gestión de tareas',
    },
  },
  apis: ['./routes/mySwaggerFile.js'], // Escanear todos los archivos .js en el proyecto
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
