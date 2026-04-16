import sql from "mssql";

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Rp@T3ch#50',
  server: process.env.DB_SERVER || '172.16.1.223',
  database: process.env.DB_DATABASE || 'P12_BI',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Em ambiente de desenvolvimento (Next.js), o hot-reload pode duplicar conexões.
// Usamos o objeto global para manter a conexão entre os reloads.
const globalForSql = global as unknown as { sqlPool: sql.ConnectionPool | null };

let pool: sql.ConnectionPool | null = globalForSql.sqlPool || null;

export async function getDbPool() {
  try {
    // Se o pool existe, mas a conexão caiu ou foi fechada pelo banco, nós a descartamos
    if (pool && !pool.connected) {
      console.log('⚠️ Conexão com o banco estava fechada. Descartando pool antigo...');
      pool = null;
    }

    // Se não há pool ativo, criamos um novo
    if (!pool) {
      console.log('🔄 Iniciando nova conexão com o SQL Server...');
      pool = new sql.ConnectionPool(dbConfig);
      await pool.connect();
      console.log('✅ Conectado ao banco de dados com sucesso!');
      
      // Salva no escopo global se estivermos em modo de desenvolvimento
      if (process.env.NODE_ENV !== "production") {
        globalForSql.sqlPool = pool;
      }
    }

    return pool;
  } catch (error) {
    console.error('❌ Falha crítica ao tentar conectar no banco:', error);
    pool = null; // Reseta para tentar novamente na próxima requisição do usuário
    throw error;
  }
}