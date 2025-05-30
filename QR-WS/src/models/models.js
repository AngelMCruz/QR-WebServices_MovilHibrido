const sqlite3 = require('sqlite3').verbose();

class Registro {
  constructor() {
    this.db = new sqlite3.Database(':memory:');
    this.inicializar();
  }

  inicializar() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS registros (
          id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
          contenido TEXT NOT NULL DEFAULT '',
          tipo TEXT NOT NULL DEFAULT 'qr'
        );
      `);
    });
  }

  obtenerTodos() {
    return new Promise((res, rej) => {
      this.db.all('SELECT * FROM registros', (err, filas) => {
        if (err) rej(err);
        else res(filas);
      });
    });
  }

  obtenerPorId(id) {
    return new Promise((res, rej) => {
      this.db.get('SELECT * FROM registros WHERE id = ?', [id], (err, fila) => {
        if (err) rej(err);
        else res(fila || null);
      });
    });
  }

  crear(contenido, tipo = 'qr') {
    return new Promise((res, rej) => {
      this.db.run(
        'INSERT INTO registros (contenido, tipo) VALUES (?, ?)',
        [contenido, tipo],
        function(err) {
          if (err) rej(err);
          else {
            this.db.get(
              'SELECT * FROM registros WHERE id = last_insert_rowid()',
              (err, fila) => {
                if (err) rej(err);
                else res(fila);
              }
            );
          }
        }
      );
    });
  }

  eliminar(id) {
    return new Promise((res, rej) => {
      this.db.get('SELECT * FROM registros WHERE id = ?', [id], (err, fila) => {
        if (err) return rej(err);
        if (!fila) return res(null);

        this.db.run('DELETE FROM registros WHERE id = ?', [id], (err) => {
          if (err) rej(err);
          else res(fila);
        });
      });
    });
  }
}

module.exports = new Registro();