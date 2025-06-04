const express = require('express');
const router = express.Router();
const registrosController = require('../controllers/controllers');

router.get('/', registrosController.obtenerTodos);
router.get('/:id(\\w+)', registrosController.obtenerPorId);
router.post('/', registrosController.crear);
router.post('/sync', registrosController.sincronizar);
router.delete('/:id(\\w+)', registrosController.eliminar);

module.exports = router;

export default router;