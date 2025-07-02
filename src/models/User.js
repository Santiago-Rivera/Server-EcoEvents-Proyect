import 'sequelize';
import { define } from '../config/db';

const User = define('User', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM('usuario', 'organizador'), defaultValue: 'usuario' },
});

export default User;