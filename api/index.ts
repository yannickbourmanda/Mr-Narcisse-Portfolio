import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Resend } from "resend";
import { cloudinaryRouter } from "../src/api-cloudinary.js";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // À configurer plus tard selon les besoins de la prod
}));
app.use(express.json());

// Init Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Router principal pour l'API
const apiRouter = express.Router();

apiRouter.post("/log-error", (req, res) => {
  console.error("====== CLIENT ERROR LOG ======");
  console.error(req.body);
  console.error("==============================");
  res.json({ ok: true });
});

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running on Vercel Serverless!" });
});

// Webhook d'automatisation des réseaux sociaux -> Synchro Firestore
apiRouter.post("/webhooks/social", async (req, res) => {
  const { title, content, category, imageUrl, source, platformId } = req.body;
  const authHeader = req.headers.authorization;
  const webhookSecret = process.env.SOCIAL_WEBHOOK_SECRET;

  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (getApps().length === 0) {
      initializeApp();
    }
    const db = getFirestore();

    const article = {
      title: title || `Post from ${source || "Social Media"}`,
      content: content ? `<p>${content.replace(/\n/g, '<br>')}</p>` : "<p>No content provided</p>",
      category: category || "Actualité",
      status: "published",
      imageUrl: imageUrl || "",
      platformId: platformId || "yannick-portfolio",
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: "admin",
      readTime: "2 min"
    };

    await db.collection("articles").add(article);
    res.status(200).json({ status: "success", message: "Article created as published" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Formulaire de contact avec Resend
apiRouter.post("/contact", async (req, res) => {
  const { firstName, lastName, email, subject, message, platformId } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required" });
  }

  if (!resend) {
    console.warn("RESEND_API_KEY manquante dans l'environnement.");
    return res.status(503).json({ error: "Email service not configured", status: "Not Sent" });
  }

  try {
    const data = await resend.emails.send({
      from: 'Contact Portfolio <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'yannick.detougou@aun.edu.ng',
      subject: `Nouveau message de ${firstName} ${lastName}: ${subject}`,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>Nom :</strong> ${firstName} ${lastName}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Plateforme :</strong> ${platformId}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    res.status(200).json({ status: "success", data });
  } catch (error: any) {
    console.error("Erreur Resend :", error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/projects/:platformId", async (req, res) => {
  const { platformId } = req.params;
  res.json({ status: "ok", message: `Fetch projects for platform: ${platformId} (not implemented)` });
});

// On branche les sous-routeurs
app.use("/api/cloudinary", cloudinaryRouter);
app.use("/api", apiRouter);

// --- LOGIQUE SÉPARÉE : DEV LOCAL VS PROD VERCEL ---
// En production sur Vercel, on ne sert pas les fichiers statiques via Express, c'est le CDN qui gère.
// On n'importe pas non plus Vite statiquement pour éviter d'alourdir le bundle de prod.
if (process.env.NODE_ENV !== "production") {
  // Import dynamique de Vite uniquement en local
  import("vite").then(async ({ createServer: createViteServer }) => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Local] Serveur prêt sur http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Impossible de charger Vite en local:", err);
  });
}

// Requis pour que Vercel traite ce fichier comme une Serverless Function
export default app;