// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";


import mercadopago from "mercadopago";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
const redirectUri = process.env.MP_REDIRECT_URI || 'http://localhost:3000/mp-callback';

//Taxa de comissão
const DEFAULT_PLATFORM_FEE = 0.03; // 3%
// NOVA: Taxa de transação do MP que será repassada ao convidado
const MP_TRANSACTION_FEE_PERCENTAGE = 0.0398; // 3.98%


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

// Rota antiga para manter a compatibilidade
app.get("/casamento/:eventId", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "evento.html"))
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
      .from("events")
      .update({ mp_credentials: credentials })
      .eq("user_id", userId);

    if (error) throw error;
    res.redirect("/dashboard?connect=success");
  } catch (error) {
    console.error("Erro no callback do Mercado Pago:", error);
    res.redirect("/dashboard?error=callback_failed");
  }
});

app.post('/create-payment-preference', async (req, res) => {
    const { cartItems, eventId } = req.body;
    if (!cartItems || cartItems.length === 0 || !eventId) {
        return res.status(400).json({ error: 'Dados inválidos.' });
    }

    try {
        const { data: eventData, error: pageError } = await supabase
            .from('events')
            .select('slug, mp_credentials, custom_fee_percentage')
            .eq('id', eventId)
            .single();

        if (pageError || !eventData) {
            return res.status(500).json({ error: 'Página do evento não encontrada.' });
        }
        if (!eventData.mp_credentials?.access_token) {
            return res.status(500).json({ error: 'O criador da página não está configurado para receber pagamentos.' });
        }
        
        const coupleAccessToken = eventData.mp_credentials.access_token;
        
        // A taxa da *plataforma* (minha) ainda é calculada sobre o valor *original* dos presentes
        const feePercentage = (typeof eventData.custom_fee_percentage === 'number')
            ? eventData.custom_fee_percentage
            : DEFAULT_PLATFORM_FEE;

        const coupleClient = new mercadopago.MercadoPagoConfig({ accessToken: coupleAccessToken });
        const couplePreference = new mercadopago.Preference(coupleClient);
        
        const items = cartItems.map(item => ({
            id: item.id.toString(),
            title: `Presente: ${item.title}`,
            quantity: 1,
            unit_price: Number(item.value),
            currency_id: 'BRL',
        }));

        // Calcula o valor original dos presentes
        const originalTotalAmount = items.reduce((acc, item) => acc + item.unit_price, 0);

        // --- LÓGICA DE REPASSAR A TAXA ---
        // 1. Calcula a taxa do MP sobre o valor original
        const mpFeeAmount = parseFloat((originalTotalAmount * MP_TRANSACTION_FEE_PERCENTAGE).toFixed(2));

        // 2. Adiciona a taxa como um item separado que será pago pelo convidado
        if (mpFeeAmount > 0) {
            items.push({
                id: 'mp_fee',
                title: 'Taxa de Conveniência (Pagamento)',
                description: 'Taxa para cobrir custos de transação do Mercado Pago.',
                quantity: 1,
                unit_price: mpFeeAmount,
                currency_id: 'BRL',
            });
        }
        // --- FIM DA LÓGICA DA TAXA ---

        // 3. A taxa da *plataforma* (minha) continua baseada no valor *original*
        const platformFeeAmount = parseFloat((originalTotalAmount * feePercentage).toFixed(2));
        
        const siteUrl = process.env.SITE_URL || "https://ilovecasamento.com.br";

        const successPath = eventData.slug ? `/${eventData.slug}` : `/evento/${eventId}`;
        const successUrl = `${siteUrl}${successPath}?status=success`;


        const result = await couplePreference.create({
            body: {
                items: items, // O array de itens agora inclui a taxa do MP
                marketplace_fee: platformFeeAmount, // A taxa da plataforma (minha)
                back_urls: {
                    success: successUrl,
                    failure: successUrl.replace('success', 'failure'),
                    pending: successUrl.replace('success', 'pending'),
                },
                auto_return: "approved",
            }     
        });
        
        res.json({ init_point: result.init_point });

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

// --- Nova Rota para links personalizados ---
app.get("/:slug", (req, res, next) => {
    const reservedPaths = ['login', 'dashboard', 'mp-callback', 'casamento', 'evento'];
    const slug = req.params.slug;

    if (slug.includes('.') || reservedPaths.includes(slug) || slug === 'favicon.ico') {
        return next();
    }
    res.sendFile(path.join(__dirname, "public", "evento.html"));
});


// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor a correr na porta ${PORT}`)
);
