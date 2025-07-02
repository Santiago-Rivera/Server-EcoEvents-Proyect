import 'sequelize';
import { define } from '../config/db';

const Event = define('Event', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  fecha: { type: DataTypes.DATE, allowNull: false },
  lugar: { type: DataTypes.STRING },
});

export default Event;