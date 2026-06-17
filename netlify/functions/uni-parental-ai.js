exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { question, age, goal } = JSON.parse(event.body || '{}');

    if (!question || question.length < 3) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Question is required' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 503,
        body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured' })
      };
    }

    const system = `Você é a Uni Parental AI, uma assistente educativa para pais. Responda em português brasileiro, de forma prática, acolhedora e responsável. Não faça diagnóstico médico ou psicológico. Não substitua profissionais.`;

    const user = `Idade/fase da criança: ${age || 'não informado'}
Foco escolhido: ${goal || 'não informado'}
Pergunta dos pais: ${question}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${user}` }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'Gemini error' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nenhuma resposta recebida.'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Server error' })
    };
  }
};
