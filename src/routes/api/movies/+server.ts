import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@libsql/client';

const client = createClient({
  url: 'file:local.db',
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


export const POST: RequestHandler = async ({ request }) => {
  try {
    const { title, description, apiKey } = await request.json();
    await insertMovie(title, description, apiKey);
    return json({ success: true });
  } catch (error: any) {
    console.error('Error inserting movie:', error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  try {
    const result = await client.execute({
      sql: 'SELECT id, title, description FROM movies',
    });
    return json({ movies: result.rows });
  } catch (error: any) {
    console.error('Error fetching movies:', error);
    return json({ error: error.message }, { status: 500 });
  }
}; 