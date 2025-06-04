const Registro = require('../models/models');

exports.obtenerTodos = async (req, res) => {
  try {
    const registros = await Registro.obtenerTodos();
    res.json(registros);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const registro = await Registro.obtenerPorId(req.params.id);
    if (registro) {
      res.json(registro);
    } else {
      res.status(404).json({ mensaje: 'No encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { contenido, tipo } = req.body;
    if (!contenido) {
      return res.status(400).json({ mensaje: 'El campo "contenido" es obligatorio' });
    }

    const nuevoRegistro = await Registro.crear(contenido, tipo);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const eliminado = await Registro.eliminar(req.params.id);
    if (eliminado) {
      res.json({ mensaje: 'Eliminado correctamente', registro: eliminado });
    } else {
      res.status(404).json({ mensaje: 'No encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.sincronizar = async (req, res) => {
  try {
    const { registros } = req.body;

    if (!Array.isArray(registros)) {
      return res.status(400).json({ mensaje: 'Se esperaba un arreglo de registros' });
    }

    await Promise.all(
      registros.map(async (r) => {
        const existente = await Registro.obtenerPorId(r.id);
        if (!existente) {
          return await Registro.crear(r.contenido, r.tipo);
        }
        return existente;
      })
    );

    const todos = await Registro.obtenerTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
