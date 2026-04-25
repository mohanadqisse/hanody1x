require('dotenv').config();
const postgres = require('postgres');

async function main() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    const res = await sql`
      ALTER TABLE thumbnails ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 0;
    `;
    console.log("Column ensured:", res);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();
