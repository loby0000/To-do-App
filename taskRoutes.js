const express = require('express');
const Task = require('./models/Task');

const router = express.Router();

// Obtener tareas
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (error) {
    res.status(400).send('Error al obtener tareas');
  }
});

// Crear tarea
router.post('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).send('Tarea no encontrada');
    res.json(task);
  } catch (error) {
    res.status(400).send('Error al buscar la tarea');
  }
});

// Modificar una tarea
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).send('Tarea no encontrada');
    res.send('Tarea eliminada exitosamente');
  } catch (error) {
    res.status(400).send('Error al eliminar la tarea');
  }
});

// Cambiar el estado de una tarea
router.patch('/:id/status', async (req, res) => {
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