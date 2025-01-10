import { createClient } from '@libsql/client';

const client = createClient({
  url: 'file:local.db',
});

// Initialize the database schema
async function initializeDatabase() {
  await client.batch(
    [
      // Create table with a vector embedding column (F32_BLOB)
      'CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, embedding F32_BLOB(768))',

      // Create a vector index for similarity search
      'CREATE INDEX IF NOT EXISTS movies_embedding_idx ON movies(libsql_vector_idx(embedding))',
    ],
    'write',
  );
}

initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully.');
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
  });


async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching embedding:', errorData);
    throw new Error(`Failed to fetch embedding: ${errorData.error.message}`);
  }

  const data = await response.json();
  return data.embedding.values;
}


async function insertMovie(title: string, description: string, apiKey: string) {
  const embedding = await getEmbedding(`${title} ${description}`, apiKey);

  await client.execute({
    sql: `
        INSERT INTO movies (title, description, embedding)
        VALUES (?, ?, ?)
        `,
    args: [title, description, new Uint8Array(Float32Array.from(embedding).buffer)],
  });
}


export { client, insertMovie }; 