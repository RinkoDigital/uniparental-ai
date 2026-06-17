exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { question, age, goal } = JSON.parse(event.body || '{}');
    if (!question || question.length < 3) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Question is required' }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 503, body: JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }) };
    }

    const system = `Você é a Uni Parental AI, uma assistente educativa para pais. Responda em português brasileiro, de forma prática, acolhedora e responsável. Não faça diagnóstico médico/psicológico. Não substitua profissionais. Sempre dê: 1) leitura rápida da situação, 2) plano prático, 3) frase pronta para o pai/mãe usar, 4) desafio pequeno do dia com XP. Oriente procurar profissional quando houver risco, atraso de desenvolvimento, violência, autolesão, abuso, negligência, febre, dor ou comportamento extremo.`;

    const user = `Idade/fase da criança: ${age || 'não informado'}\nFoco escolhido: ${goal || 'não informado'}\nPergunta dos pais: ${question}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.45,
        max_tokens: 650
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || 'OpenAI error' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: data.choices?.[0]?.message?.content || '' })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Server error' }) };
  }
};
