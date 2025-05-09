const express = require('express');
const User = require('./models/User');
const Task = require('./models/Task');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware de autenticación para extraer userId del token
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token no proporcionado');
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) return res.status(401).send('Token inválido');
    req.userId = decoded.userId;
    next();
  });
}

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error al registrar usuario
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */

// Registro
router.post('/register', async (req, res) => {
  console.log('POST /register - body:', req.body);
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    console.log('Usuario registrado exitosamente:', username);
    res.status(201).send('Usuario registrado exitosamente');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(400).send('Error al registrar usuario');
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  console.log('POST /login - body:', req.body);
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('Intento de login fallido para usuario:', username);
      return res.status(401).send('Credenciales inválidas');
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    console.log('Login exitoso para usuario:', username);
    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(400).send('Error al iniciar sesión');
  }
});

// Proteger rutas de tareas con el middleware
router.use('/tasks', authMiddleware);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Obtener tareas
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para la paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de tareas por página
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filtrar tareas por estado de completado
 *     responses:
 *       200:
 *         description: Lista de tareas con éxito
 *       400:
 *         description: Error al obtener tareas
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       400:
 *         description: Error al crear tarea
 */

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Obtener una tarea por ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea a obtener
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       404:
 *         description: Tarea no encontrada
 */

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Modificar una tarea
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea a modificar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tarea modificada exitosamente
 *       400:
 *         description: Error al modificar la tarea
 *       404:
 *         description: Tarea no encontrada
 */

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea a eliminar
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente
 *       404:
 *         description: Tarea no encontrada
 */

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Cambiar el estado de una tarea
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea cuyo estado se va a cambiar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de tarea actualizado
 *       404:
 *         description: Tarea no encontrada
 */

// Obtener tareas con paginación y filtros
router.get('/tasks', async (req, res) => {
  console.log('GET /tasks - userId:', req.userId, 'query:', req.query);
  try {
    const { page = 1, limit = 10, completed } = req.query;
    const filters = { userId: req.userId };
    if (completed !== undefined) {
      filters.completed = completed === 'true';
    }
    const tasks = await Task.find(filters)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Task.countDocuments(filters);
    res.json({ tasks, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(400).send('Error al obtener tareas');
  }
});

// Crear tarea
router.post('/tasks', async (req, res) => {
  console.log('POST /tasks - body:', req.body, 'userId:', req.userId);
  try {
    const { title, description } = req.body;
    const task = new Task({ title, description, userId: req.userId });
    await task.save();
    res.status(201).send('Tarea creada exitosamente');
  } catch (error) {
    res.status(400).send('Error al crear tarea');
  }
});

// Buscar una tarea por ID
router.get('/tasks/:id', async (req, res) => {
  console.log('GET /tasks/:id - params:', req.params, 'userId:', req.userId);
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).send('Tarea no encontrada');
    res.json(task);
  } catch (error) {
    res.status(400).send('Error al buscar la tarea');
  }
});

// Modificar una tarea
router.put('/tasks/:id', async (req, res) => {
  console.log('PUT /tasks/:id - params:', req.params, 'body:', req.body, 'userId:', req.userId);
  try {
    const { title, description, completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, completed },
      { new: true }
    );
    if (!task) return res.status(404).send('Tarea no encontrada');
    res.json(task);
  } catch (error) {
    res.status(400).send('Error al modificar la tarea');
  }
});

// Eliminar una tarea
router.delete('/tasks/:id', async (req, res) => {
  console.log('DELETE /tasks/:id - params:', req.params, 'userId:', req.userId);
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).send('Tarea no encontrada');
    res.send('Tarea eliminada exitosamente');
  } catch (error) {
    res.status(400).send('Error al eliminar la tarea');
  }
});

// Cambiar el estado de una tarea
router.patch('/tasks/:id/status', async (req, res) => {
  console.log('PATCH /tasks/:id/status - params:', req.params, 'body:', req.body, 'userId:', req.userId);
  try {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { completed },
      { new: true }
    );
    if (!task) return res.status(404).send('Tarea no encontrada');
    res.json(task);
  } catch (error) {
    res.status(400).send('Error al cambiar el estado de la tarea');
  }
});

module.exports = router;