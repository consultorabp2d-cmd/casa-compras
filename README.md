# Despensa & Compras: guia de publicação

A app lê fotos do frigorífico, congelador e despensa e gera a lista de compras e o orçamento.
Estrutura: `public/` (a app, instalável no telemóvel) e `api/ai.js` (servidor que guarda a chave da Anthropic).

## 1. Chave da API
1. Crie conta em console.anthropic.com e adicione crédito (poucos euros chegam para testar).
2. Em **API Keys**, crie uma chave e copie-a. Defina um **limite de gasto mensal** nas definições.

## 2. Pôr online (grátis para começar)
1. Crie conta em github.com. Crie um repositório novo e carregue **todo o conteúdo desta pasta** (Add file → Upload files).
2. Crie conta em vercel.com (entre com o GitHub). **Add New → Project** e escolha o repositório. Prima Deploy.
3. No projeto, **Settings → Environment Variables**, crie:
   - `ANTHROPIC_API_KEY`: a chave do passo 1
   - `ACCESS_CODE`: um código à sua escolha (protege a app para ninguém gastar o seu crédito)
4. **Deployments → Redeploy** para as variáveis ficarem ativas.

## 3. Usar no telemóvel
Abra o endereço que a Vercel dá (termina em `.vercel.app`) e use **Adicionar ao ecrã principal**.
Na primeira análise de fotos a app pede o código de acesso e guarda-o no telemóvel.

## Notas
- Cada análise de fotos tem custo (cêntimos). Modelos configuráveis com `ANTHROPIC_MODEL` e `ANTHROPIC_MODEL_CHEAP`.
- Contas e listas ficam guardadas **em cada dispositivo**. Não há sincronização entre telemóveis nem recuperação de palavra-passe. Isso exige uma base de dados (ex.: Supabase), que é a evolução seguinte.
- Se partilhar o código de acesso com outras pessoas, o gasto sai do seu crédito.
- Fotos do interior da casa são dados pessoais: se abrir a app ao público, será preciso política de privacidade (RGPD).
