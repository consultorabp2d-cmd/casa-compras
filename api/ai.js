// Servidor: lê fotos e estima preços com a API da Anthropic. A chave fica só aqui (variável de ambiente).
const crypto = require("crypto");
const URL_API = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MODEL_CHEAP = process.env.ANTHROPIC_MODEL_CHEAP || "claude-haiku-5-5";

const same = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
async function ask(model, content) {
  const r = await fetch(URL_API, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: "user", content }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || "Erro na API");
  const t = (j.content || []).map(c => c.text || "").join("");
  const m = t.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Resposta inesperada");
  return JSON.parse(m[0]);
}
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });
  if (!process.env.ANTHROPIC_API_KEY || !process.env.ACCESS_CODE) return res.status(500).json({ error: "Servidor sem configuração (ANTHROPIC_API_KEY e ACCESS_CODE)." });
  if (!same(req.headers["x-access-code"] || "", process.env.ACCESS_CODE)) return res.status(401).json({ error: "Código incorreto" });
  try {
    const b = req.body || {};
    if (b.action === "analyze") {
      const images = (b.images || []).slice(0, 6);
      if (!images.length) return res.status(400).json({ error: "Sem imagens" });
      const zone = String(b.zone || "").slice(0, 30);
      const content = images.map(d => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: String(d) } }));
      content.push({ type: "text", text: `Estas fotos mostram o interior de: ${zone} (de uma casa em Portugal). Identifica todos os alimentos e produtos domésticos visíveis. Responde APENAS com JSON, sem texto nem markdown, no formato:
{"itens":[{"nome":"Leite","qtd":"cerca de 1 litro","estado":"ok"}]}
Regras: nomes curtos em português europeu, sem repetir itens (junta duplicados); "qtd" é uma estimativa curta; "estado" é "pouco" se parecer quase vazio/a acabar e "ok" caso contrário. Ignora o que não for claro.` });
      return res.status(200).json(await ask(MODEL, content));
    }
    if (b.action === "estimate") {
      const names = (b.names || []).slice(0, 60).map(n => String(n).slice(0, 60));
      const text = `Estima o preço típico em euros, num supermercado em Portugal (gama média), de uma unidade ou embalagem normal de cada produto. Responde APENAS com JSON no formato {"precos":{"Nome exato":1.25}} usando exatamente estes nomes: ${JSON.stringify(names)}`;
      return res.status(200).json(await ask(MODEL_CHEAP, [{ type: "text", text }]));
    }
    return res.status(400).json({ error: "Ação desconhecida" });
  } catch (e) {
    return res.status(500).json({ error: "Falha ao analisar: " + e.message });
  }
};
