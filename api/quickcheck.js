// api/quickcheck.js — Vercel Serverless Function
// Empfängt URL, analysiert via Anthropic API, speichert Ergebnis als MD
// Rate Limit: 20 Checks/Tag via KV-Store (Vercel KV oder file-basiert)

import Anthropic from '@anthropic-ai/sdk';

// Rate-Limit: In-Memory für den Serverless-Prozess + Edge Config Fallback
// Da Vercel Functions keinen shared state haben, nutzen wir eine einfache
// IP-basierte In-Memory Map die bei Kaltstart resettet (akzeptabel für MVP)
// Für Production: Vercel KV oder Upstash Redis

const DAILY_LIMIT = 20;
let requestCount = 0;
let requestDate = new Date().toISOString().slice(0, 10);

function checkRateLimit() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== requestDate) {
    // Neuer Tag: Reset
    requestDate = today;
    requestCount = 0;
  }
  if (requestCount >= DAILY_LIMIT) return false;
  requestCount++;
  return true;
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url, email } = req.body;
  if (!url || !url.includes('.')) {
    return res.status(400).json({ error: 'Keine gültige URL' });
  }

  // URL normalisieren
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;

  // Rate Limit prüfen
  if (!checkRateLimit()) {
    return res.status(429).json({ 
      error: 'Tageslimit erreicht. Bitte morgen wieder versuchen oder direkt Termin buchen.',
      limitReached: true
    });
  }

  // Anthropic API aufrufen
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  try {
    const prompt = `Du bist ein EU AI Act Compliance-Experte. Analysiere diese Website-URL auf Chatbot-Compliance.

URL: ${cleanUrl}

WICHTIG: Du kannst die URL nicht direkt besuchen. Analysiere basierend auf:
1. Domain-Name und bekannten Plattformen (z.B. wenn "intercom" in Tracking-Skripten vorkommt)
2. Typische Compliance-Patterns für die erkannte Branche
3. Allgemeinen EU AI Act Anforderungen

Antworte NUR mit diesem JSON (kein anderer Text):
{
  "platform": "Erkannte Plattform (Intercom/HubSpot/Zendesk/Freshdesk/Tidio/Custom/Unbekannt)",
  "article52": "Vorhanden|Fehlt|Unklar",
  "article52_detail": "Kurze Begründung (max 80 Zeichen)",
  "riskLevel": "Hoch|Mittel|Niedrig",
  "riskReason": "Kurze Begründung (max 80 Zeichen)",
  "topIssue": "Wichtigstes Problem (max 60 Zeichen)",
  "industryGuess": "Erkannte Branche (max 30 Zeichen)"
}

Regeln:
- article52 = "Vorhanden" nur wenn typischerweise ein "Mit KI-Assistent" Hinweis zu erwarten ist
- riskLevel = "Hoch" für Fintech/Legal/Health/HR, "Mittel" für E-Commerce/SaaS, "Niedrig" für einfache Info-Bots
- Sei konservativ: wenn unklar, setze auf schlechteres Ergebnis (Fehlt, Hoch)
- Erfinde KEINE spezifischen Fakten über die Firma — nur allgemeine Einschätzung`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text.trim();
    
    // JSON parsen
    let analysis;
    try {
      // Nur JSON extrahieren falls claude etwas drumherum schreibt
      const jsonMatch = responseText.match(/\{[\s\S]+\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      // Fallback mit Standard-Werten
      analysis = {
        platform: 'Unbekannt',
        article52: 'Unklar',
        article52_detail: 'Automatische Analyse nicht möglich',
        riskLevel: 'Mittel',
        riskReason: 'Keine Chatbot-Details erkennbar',
        topIssue: 'Manuelle Prüfung empfohlen',
        industryGuess: 'Unbekannt'
      };
    }

    // Ergebnis als MD speichern (für Knowledge Compiler)
    const domain = cleanUrl.replace(/^https?:\/\//, '').replace(/\//g, '_').slice(0, 50);
    const date = new Date().toISOString().slice(0, 10);
    const mdContent = [
      `---`,
      `firma: ${domain}`,
      `datum: ${date}`,
      `url: ${cleanUrl}`,
      `chatbot_platform: ${analysis.platform}`,
      `article52: ${analysis.article52}`,
      `risk_level: ${analysis.riskLevel}`,
      `top_issue: ${analysis.topIssue}`,
      `email: ${email || ''}`,
      `type: quickcheck`,
      `---`,
      ``,
      `# Quick-Check: ${domain}`,
      ``,
      `**Datum:** ${date}`,
      `**Typ:** Quick-Check (automatisiert, oberflächlich)`,
      ``,
      `## Ergebnisse`,
      ``,
      `- Erkannte Plattform: ${analysis.platform}`,
      `- Art. 52 Transparenz: ${analysis.article52} — ${analysis.article52_detail}`,
      `- Risikostufe: ${analysis.riskLevel} — ${analysis.riskReason}`,
      `- Wichtigstes Problem: ${analysis.topIssue}`,
      `- Branche: ${analysis.industryGuess}`,
      ``,
      `## Hinweis`,
      ``,
      `Quick-Check basiert auf URL-Analyse ohne Besuch der Website.`,
      `Für vollständigen Audit: chatbotaudit.vercel.app`,
    ].join('\n');

    // In Vercel Function können wir kein FS schreiben — MD wird über Webhook/Cron sync'd
    // Für MVP: MD-Content als Response mitschicken, Cron holt ihn später
    // TODO: Vercel Blob oder R2 für persistente MD-Ablage
    
    // Email loggen (optional, für Lead-Capture)
    if (email && email.includes('@')) {
      console.log(`LEAD_EMAIL: ${email} | ${cleanUrl} | ${analysis.riskLevel}`);
      // Trigger externe Lead-Capture (Telegram, Formsubmit etc.) wenn gewünscht
    }

    return res.status(200).json({
      success: true,
      platform: analysis.platform,
      article52: analysis.article52,
      article52Detail: analysis.article52_detail,
      riskLevel: analysis.riskLevel,
      riskReason: analysis.riskReason,
      topIssue: analysis.topIssue,
      industry: analysis.industryGuess,
      mdContent, // Für späteren sync
      url: cleanUrl
    });

  } catch (apiError) {
    console.error('Anthropic API Error:', apiError.message);
    return res.status(500).json({ 
      error: 'Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.',
      details: process.env.NODE_ENV === 'development' ? apiError.message : undefined
    });
  }
}
