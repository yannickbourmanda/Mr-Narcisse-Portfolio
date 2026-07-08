import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Resend } from "resend";
import { cloudinaryRouter } from "./src/api-cloudinary.js";

// You can configure your Firebase Admin setup here if you have a service account JSON.
// If running on a Google Cloud environment with default credentials, this initializes automatically:
// if (getApps().length === 0) {
//   initializeApp();
// }
// const db = getFirestore();

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev, configure properly for prod
  }));
  app.use(express.json());

  // API Routes
  const apiRouter = express.Router();

  apiRouter.post("/log-error", (req, res) => {
    console.error("====== CLIENT ERROR LOG ======");
    console.error(req.body);
    console.error("==============================");
    res.json({ ok: true });
  });
  
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Single Backend for all platforms is running!" });
  });

  apiRouter.post("/webhooks/social", async (req, res) => {
    const { title, content, category, imageUrl, source, platformId } = req.body;
    
    // Authorization check - you could add a secret token in headers
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
        status: "published", // Creates as published immediately
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

  apiRouter.post("/contact", async (req, res) => {
    const { firstName, lastName, email, subject, message, platformId } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    if (!resend) {
      console.warn("RESEND_API_KEY non configurée. Impossible d'envoyer l'email.");
      return res.status(503).json({ error: "Email service not configured", status: "Not Sent" });
    }

    try {
      const data = await resend.emails.send({
        from: 'Contact Portfolio <onboarding@resend.dev>', // Modifiez l'adresse d'expédition pour correspondre à votre domaine
        to: process.env.CONTACT_EMAIL || 'yannick.detougou@aun.edu.ng', // Votre adresse de destination
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
      console.error("Erreur lors de l'envoi de l'email :", error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.get("/projects/:platformId", async (req, res) => {
    const { platformId } = req.params;
    // Example of how you would fetch from Firebase Admin SDK
    // const snapshot = await db.collection("projects").where("platformId", "==", platformId).get();
    // const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // res.json(projects);
    res.json({ status: "ok", message: `Fetch projects for platform: ${platformId} (not implemented)` });
  });

  app.use("/api/cloudinary", cloudinaryRouter);
  
  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
