// Script para probar diferentes configuraciones de PostgreSQL
import pg from 'pg';
const { Client } = pg;

const configs = [
  {
    user: 'postgres',
    host: 'localhost',
    database: 'eco_eventos',
    password: 'postgres',
    port: 5432,
  },
  {
    user: 'postgres',
    host: 'localhost',
    database: 'eco_eventos',
    password: 'password',
    port: 5432,
  },
  {
    user: 'postgres',
    host: 'localhost',
    database: 'eco_eventos',
    password: '',
    port: 5432,
  },
  {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
  }
];

async function testConnections() {
  console.log('🔍 Probando conexiones a PostgreSQL...\n');
  
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log(`Prueba ${i + 1}: ${config.user}@${config.host}:${config.port}/${config.database}`);
    console.log(`Password: "${config.password}"`);
    
    const client = new Client(config);
    
    try {
      await client.connect();
      console.log('✅ Conexión exitosa!');
      
      // Probar consulta
      const result = await client.query('SELECT version()');
      console.log(`📊 PostgreSQL version: ${result.rows[0].version.split(' ')[0]}`);
      
      // Mostrar URL de conexión
      const dbUrl = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
      console.log(`🔗 URL: ${dbUrl}`);
      
      await client.end();
      break;
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignorar errores al cerrar
      }
    }
    console.log('---');
  }
}

testConnections().catch(console.error);
