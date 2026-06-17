Uni Parental AI - instruções rápidas

1) O chat já funciona no navegador com uma IA demo local baseada em regras educativas.
2) Para ativar IA real com OpenAI no Netlify:
   - Publique o site no Netlify.
   - Vá em Site settings > Environment variables.
   - Crie a variável OPENAI_API_KEY com sua chave da OpenAI.
   - Faça novo deploy.
3) O frontend tenta usar /.netlify/functions/uni-parental-ai.
   Se a chave não existir, ele usa automaticamente a IA demo local.

Aviso: a IA é educativa e não substitui profissional de saúde, psicólogo, pediatra ou atendimento de emergência.
