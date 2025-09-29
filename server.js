// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// SDK Mercado Pago (Forma correta de importar)
import mercadopago from "mercadopago";

// --- Configuração para obter o __dirname em ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configurações ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("--- ERRO CRÍTICO ---");
  console.error(
    "As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY não foram encontradas."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const mpClientId = process.env.MP_CLIENT_ID;
const mpClientSecret = process.env.MP_CLIENT_SECRET;
const redirectUri =
  process.env.MP_REDIRECT_URI || "http://localhost:3000/mp-callback";

const PLATFORM_FEE_PERCENTAGE = 0.03;

// --- Inicialização Mercado Pago (usando o objeto importado) ---
const client = new mercadopago.MercadoPagoConfig({ accessToken: mpAccessToken });
const oauth = new mercadopago.OAuth(client);
const preference = new mercadopago.Preference(client);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- ROTAS DO SITE ---
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "landing.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
);
app.get("/casamento/:pageId", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "casamento.html"))
);

// --- ROTAS DE API ---
app.post("/create-mp-connect-link", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID is required" });
  try {
    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${mpClientId}&response_type=code&platform_id=mp&state=${userId}&redirect_uri=${redirectUri}`;
    res.json({ authUrl });
  } catch (error) {
    console.error("Erro ao criar link de conexão:", error);
    res.status(500).json({ error: "Failed to create connect link" });
  }
});

app.get("/mp-callback", async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code || !userId) return res.redirect("/dashboard?error=auth_failed");
  try {
    const credentials = await oauth.create({
      body: {
        client_secret: mpClientSecret,
        client_id: mpClientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      },
    });

    const { error } = await supabase
      .from("wedding_pages")
      .update({ mp_credentials: credentials })
      .eq("user_id", userId);

    if (error) throw error;
    res.redirect("/dashboard?connect=success");
  } catch (error) {
    console.error("Erro no callback do Mercado Pago:", error);
    res.redirect("/dashboard?error=callback_failed");
  }
});

app.post("/get-mp-balance", async (req, res) => {
  // implementar futuramente se precisar
  res.json({ balance: 0 });
});

app.post('/create-payment-preference', async (req, res) => {
    const { cartItems, weddingPageId } = req.body;

    if (!cartItems || cartItems.length === 0 || !weddingPageId) {
        return res.status(400).json({ error: 'Dados inválidos.' });
    }

    try {
        const { data: pageData, error: pageError } = await supabase
            .from('wedding_pages')
            .select('mp_credentials')
            .eq('id', weddingPageId)
            .single();

        if (pageError || !pageData || !pageData.mp_credentials?.access_token) {
            console.error("Erro: Credenciais do casal não encontradas.", pageError);
            return res.status(500).json({ error: 'O criador da página não está configurado para receber pagamentos.' });
        }
        
        const coupleAccessToken = pageData.mp_credentials.access_token;
        
        const coupleClient = new mercadopago.MercadoPagoConfig({ accessToken: coupleAccessToken });
        const couplePreference = new mercadopago.Preference(coupleClient);
        
        const items = cartItems.map(item => ({
            id: item.id.toString(),
            title: `Presente: ${item.title}`,
            quantity: 1,
            unit_price: Number(item.value),
            currency_id: 'BRL',
        }));

        const totalAmount = items.reduce((acc, item) => acc + item.unit_price, 0);
        const feeAmount = parseFloat((totalAmount * PLATFORM_FEE_PERCENTAGE).toFixed(2));

        // Define a URL base. Usa a variável de ambiente se existir, caso contrário, usa a sua URL de produção.
        const siteUrl = process.env.SITE_URL || "https://ilovecasamento.com.br";

        const result = await couplePreference.create({
            body: {
                items: items,
                marketplace_fee: feeAmount,
                // CORREÇÃO AQUI: As URLs agora usam o seu domínio de produção
                back_urls: {
                    success: `${siteUrl}/casamento/${weddingPageId}?status=success`,
                    failure: `${siteUrl}/casamento/${weddingPageId}?status=failure`,
                    pending: `${siteUrl}/casamento/${weddingPageId}?status=pending`,
                },
                auto_return: "approved",
            }
        });
        
        const initPoint = result?.init_point ?? null;
        if (!initPoint) throw new Error("init_point não encontrado na resposta do Mercado Pago");
        
        res.json({ init_point: initPoint });

    } catch (error) {
        console.error("--- ERRO DETALHADO AO CRIAR PREFERÊNCIA DE PAGAMENTO ---");
        if (error.cause) {
             console.error("Causa do Erro (API do Mercado Pago):", JSON.stringify(error.cause, null, 2));
        } else {
             console.error("Mensagem de Erro Geral:", error.message);
        }
        console.error("---------------------------------------------------------");
        res.status(500).json({ error: 'Não foi possível processar o seu pedido.' });
    }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor a correr na porta ${PORT}`)
);

