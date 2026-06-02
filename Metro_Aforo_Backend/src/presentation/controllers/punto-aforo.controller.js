const { success } = require('../../shared/helpers/response');

class PuntoAforoController {
  constructor({ puntoAforoRepository }) {
    this.puntoAforoRepository = puntoAforoRepository;
  }

  listar = async (_req, res, next) => {
    try {
      const puntos = await this.puntoAforoRepository.findAll();
      return success(res, puntos, 'Puntos de aforo obtenidos');
    } catch (err) { next(err); }
  };

  crear = async (req, res, next) => {
    try {
      const punto = await this.puntoAforoRepository.create(req.body);
      return success(res, punto, 'Punto de aforo creado', 201);
    } catch (err) { next(err); }
  };

  actualizar = async (req, res, next) => {
    try {
      const punto = await this.puntoAforoRepository.update(Number(req.params.id), req.body);
      if (!punto) return res.status(404).json({ ok: false, message: 'Punto no encontrado' });
      return success(res, punto, 'Punto actualizado');
    } catch (err) { next(err); }
  };

  eliminar = async (req, res, next) => {
    try {
      await this.puntoAforoRepository.delete(Number(req.params.id));
      return success(res, null, 'Punto eliminado');
    } catch (err) { next(err); }
  };
}

module.exports = PuntoAforoController;
