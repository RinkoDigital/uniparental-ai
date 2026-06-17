(() => {
  const form = document.getElementById('aiForm');
  const questionInput = document.getElementById('aiQuestion');
  const messages = document.getElementById('aiMessages');
  const ageSelect = document.getElementById('childAge');
  const goalSelect = document.getElementById('parentGoal');

  if (!form || !questionInput || !messages) return;

  const safety = "\n\nObservação: se houver risco de agressão, autoagressão, abuso, negligência, atraso importante no desenvolvimento, perda de fala, febre, dor intensa ou comportamento fora do comum, procure um profissional de saúde ou emergência local.";

  const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function addMessage(role, text, loading = false) {
    const box = document.createElement('div');
    box.className = `ai-message ${role} ${loading ? 'loading' : ''}`;
    box.innerHTML = `<strong>${role === 'user' ? 'Você' : 'Uni Parental AI'}</strong><p></p>`;
    box.querySelector('p').textContent = text;
    messages.appendChild(box);
    messages.scrollTop = messages.scrollHeight;
    return box;
  }

  function localAI(question, age, goal) {
    const q = normalize(question);
    let theme = goal;
    if (q.includes('tv') || q.includes('tela') || q.includes('tablet') || q.includes('celular') || q.includes('youtube')) theme = 'telas e tecnologia';
    if (q.includes('sono') || q.includes('dorm') || q.includes('cama') || q.includes('noite')) theme = 'sono e rotina';
    if (q.includes('birra') || q.includes('grita') || q.includes('chora') || q.includes('limite')) theme = 'limites e birras';
    if (q.includes('escola') || q.includes('professor') || q.includes('colega') || q.includes('bater')) theme = 'escola e comportamento';
    if (q.includes('fala') || q.includes('conversa') || q.includes('escuta') || q.includes('obedec')) theme = 'comunicação';

    const ageNote = age === '0-2 anos'
      ? 'Nessa idade, a criança ainda regula emoções principalmente pelo adulto. Use poucas palavras, previsibilidade e presença física calma.'
      : age === '3-5 anos'
      ? 'Nessa idade, emoção vem antes da lógica. A estratégia precisa ser curta, visual e repetida todos os dias.'
      : age === 'adolescente'
      ? 'Com adolescente, controle direto costuma gerar resistência. Melhor combinar limites claros, escuta real e consequência previamente acordada.'
      : 'Para essa fase, combine limite claro, rotina previsível e participação da criança na solução.';

    const library = {
      'telas e tecnologia': {
        plan: '1) Avise antes da transição. 2) Dê uma escolha limitada. 3) Mantenha o limite sem negociar no choro. 4) Ofereça uma próxima atividade concreta.',
        phrase: '“Faltam 5 minutos. Quando acabar, você pode escolher: guardar o controle comigo ou colocar ele na mesa.”',
        challenge: 'Hoje: use um aviso de 5 minutos antes de desligar a tela e mantenha a mesma frase até o fim. +20 XP em consistência.'
      },
      'sono e rotina': {
        plan: '1) Reduza estímulos 40 minutos antes. 2) Crie uma sequência fixa: banho, pijama, livro, luz baixa. 3) Evite longas conversas depois da hora combinada. 4) Repita por 7 dias antes de mudar a estratégia.',
        phrase: '“Agora é hora do corpo descansar. Eu fico perto, mas a rotina continua.”',
        challenge: 'Hoje: faça a mesma sequência de sono sem telas antes de dormir. +20 XP em rotina.'
      },
      'limites e birras': {
        plan: '1) Nomeie a emoção. 2) Diga o limite em uma frase. 3) Não explique demais no pico da birra. 4) Depois que acalmar, ensine o comportamento esperado.',
        phrase: '“Eu vejo que você ficou bravo. Mesmo assim, bater/gritar não resolve. Eu vou te ajudar a se acalmar.”',
        challenge: 'Hoje: escolha um limite e mantenha com voz baixa, sem ameaças longas. +20 XP em limite calmo.'
      },
      'escola e comportamento': {
        plan: '1) Pergunte o que aconteceu antes de julgar. 2) Separe emoção de comportamento. 3) Ensine reparação: pedir desculpa, combinar próxima ação, reparar dano. 4) Converse com a escola se repetir.',
        phrase: '“Você pode sentir raiva. O que não pode é machucar. O que você pode fazer da próxima vez?”',
        challenge: 'Hoje: treine uma alternativa prática: respirar, pedir ajuda ou se afastar. +20 XP em reparação.'
      },
      'comunicação': {
        plan: '1) Abaixe na altura da criança. 2) Use frase curta. 3) Peça uma ação por vez. 4) Elogie o comportamento específico quando ela tenta cooperar.',
        phrase: '“Olha para mim. Primeiro vamos guardar os brinquedos. Depois você escolhe o livro.”',
        challenge: 'Hoje: troque uma bronca longa por uma instrução curta e específica. +20 XP em comunicação clara.'
      }
    };

    const item = library[theme] || library['limites e birras'];
    return `${ageNote}\n\nPlano prático:\n${item.plan}\n\nFrase pronta:\n${item.phrase}\n\nDesafio de hoje:\n${item.challenge}${safety}`;
  }

  async function askServerAI(question, age, goal) {
    const response = await fetch('/.netlify/functions/uni-parental-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, age, goal })
    });
    if (!response.ok) throw new Error('AI server unavailable');
    const data = await response.json();
    if (!data.answer) throw new Error('Empty AI response');
    return data.answer;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (!question) return;

    const age = ageSelect.value;
    const goal = goalSelect.value;
    addMessage('user', question);
    questionInput.value = '';
    const button = form.querySelector('button');
    button.disabled = true;
    const loading = addMessage('bot', 'Pensando em uma orientação segura e prática', true);

    try {
      let answer;
      try {
        answer = await askServerAI(question, age, goal);
      } catch (_) {
        answer = localAI(question, age, goal);
      }
      loading.classList.remove('loading');
      loading.querySelector('p').textContent = answer;
    } catch (error) {
      loading.classList.remove('loading');
      loading.querySelector('p').textContent = 'Não consegui responder agora. Tente reformular a pergunta em uma situação mais específica.';
    } finally {
      button.disabled = false;
      messages.scrollTop = messages.scrollHeight;
    }
  });
})();
