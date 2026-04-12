#!/usr/bin/env node
// generate-stats.js
// Liest wiki-mirror/audits/ + wiki-mirror/quickchecks/ und schreibt data/stats.json
// Wird täglich von cron aufgerufen, danach Vercel deploy

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const AUDIT_DIR = path.join(BASE, 'wiki-mirror', 'audits');
const QUICKCHECK_DIR = path.join(BASE, 'wiki-mirror', 'quickchecks');
const STATS_FILE = path.join(BASE, 'data', 'stats.json');

// Platform-Detection aus Dateiinhalt
function detectPlatform(content) {
  const lower = content.toLowerCase();
  if (lower.includes('intercom')) return 'Intercom';
  if (lower.includes('hubspot') || lower.includes('hs-scripts')) return 'HubSpot';
  if (lower.includes('zendesk')) return 'Zendesk';
  if (lower.includes('salesforce') || lower.includes('live agent')) return 'Salesforce';
  if (lower.includes('tidio')) return 'Tidio';
  if (lower.includes('freshdesk') || lower.includes('freshchat')) return 'Freshdesk';
  return 'Unbekannt';
}

// Compliance-Score aus Audit extrahieren (0-5 Skala)
// Sucht nach "accuracy", "compliance_score" oder berechnet aus Audit-Befunden
function extractComplianceScore(content) {
  // Suche nach explizitem compliance-score im Frontmatter
  const frontmatterScore = content.match(/compliance_score:\s*([\d.]+)/i);
  if (frontmatterScore) return parseFloat(frontmatterScore[1]);

  // Suche nach accuracy-Score (z.B. "7/10" oder "accuracy: 3/5")
  const accuracyMatch = content.match(/accuracy[^:]*:\s*(\d+)\/(\d+)/i);
  if (accuracyMatch) {
    const ratio = parseInt(accuracyMatch[1]) / parseInt(accuracyMatch[2]);
    // Art. 52 compliance ist strenger als accuracy allein
    // Quick-check: accuracy >= 80% = 3/5, 60-80% = 2/5, <60% = 1/5
    // Minus Punkte für fehlende Transparenz/Eskalation
    return Math.round(ratio * 3 * 10) / 10; // max 3 aus Accuracy
  }

  return null;
}

// Häufigstes Problem aus Audit extrahieren
function extractTopIssue(content) {
  const lower = content.toLowerCase();
  
  // Priorisierte Issue-Erkennung
  if (lower.includes('art. 52') || lower.includes('artikel 52') || 
      lower.includes('transparenz') && lower.includes('ki') && lower.includes('fehlt')) {
    return 'Art. 52 Transparenz';
  }
  if (lower.includes('eskalation') && (lower.includes('fehlt') || lower.includes('keine'))) {
    return 'Eskalationspflicht';
  }
  if (lower.includes('datenlösch') || lower.includes('daten löschen') || 
      lower.includes('löschfrist')) {
    return 'Datenlöschung';
  }
  if (lower.includes('dsgvo') && lower.includes('fehlt')) {
    return 'DSGVO-Lücke';
  }
  if (lower.includes('high-risk') || lower.includes('high risk') || 
      lower.includes('annex iii')) {
    return 'High-Risk unklar';
  }
  if (lower.includes('accuracy') && (lower.includes('falsch') || lower.includes('fehler'))) {
    return 'Accuracy-Problem';
  }
  if (lower.includes('ressourcenplanung') || lower.includes('roadmap') && 
      lower.includes('falsch')) {
    return 'Veraltete Infos';
  }
  
  return 'Art. 52 Transparenz'; // Default: häufigstes Problem
}

// Audits verarbeiten
function processAudits() {
  const platforms = {};
  let totalAudits = 0;
  let totalQuickchecks = 0;

  // Normale Audits
  if (fs.existsSync(AUDIT_DIR)) {
    const files = fs.readdirSync(AUDIT_DIR).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(AUDIT_DIR, file), 'utf-8');
      const platform = detectPlatform(content);
      const score = extractComplianceScore(content);
      const issue = extractTopIssue(content);
      
      if (!platforms[platform]) {
        platforms[platform] = { count: 0, scores: [], issues: {} };
      }
      
      platforms[platform].count++;
      if (score !== null) platforms[platform].scores.push(score);
      platforms[platform].issues[issue] = (platforms[platform].issues[issue] || 0) + 1;
      totalAudits++;
    }
  }

  // Quick-Checks (werden wie Audits gezählt)
  if (fs.existsSync(QUICKCHECK_DIR)) {
    const files = fs.readdirSync(QUICKCHECK_DIR).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(QUICKCHECK_DIR, file), 'utf-8');
      const platform = detectPlatform(content);
      
      if (!platforms[platform]) {
        platforms[platform] = { count: 0, scores: [], issues: {} };
      }
      
      // Quick-checks zählen als Analysen aber nicht als vollwertige Compliance-Scores
      platforms[platform].count++;
      totalQuickchecks++;
    }
  }

  return { platforms, totalAudits, totalQuickchecks };
}

// Stats-JSON generieren
function generateStats() {
  const { platforms, totalAudits, totalQuickchecks } = processAudits();
  const totalAnalyzed = totalAudits + totalQuickchecks;
  
  // Deadline berechnen
  const deadline = new Date('2026-08-02T00:00:00+02:00');
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  // Plattform-Tabelle aufbauen
  const platformTable = Object.entries(platforms)
    .map(([name, data]) => {
      const avgScore = data.scores.length >= 3 
        ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
        : null;
      
      // Häufigstes Problem
      const topIssue = data.issues && Object.keys(data.issues).length > 0
        ? Object.entries(data.issues).sort((a, b) => b[1] - a[1])[0][0]
        : 'Art. 52 Transparenz';
      
      return {
        name,
        audits: data.count,
        avgScore: avgScore ? `${avgScore}/5` : null,
        topIssue
      };
    })
    .sort((a, b) => b.audits - a.audits);
  
  const stats = {
    generated: new Date().toISOString(),
    totalAnalyzed,
    totalAudits,
    totalQuickchecks,
    daysLeft,
    compliantCount: 0, // Wird erst relevant wenn wir compliant-Audits haben
    platformTable
  };
  
  // data/ Verzeichnis sicherstellen
  const dataDir = path.join(BASE, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  console.log(`Stats generiert: ${totalAnalyzed} Analysen, ${daysLeft} Tage bis Deadline`);
  console.log(`Plattformen: ${platformTable.map(p => `${p.name}(${p.audits})`).join(', ')}`);
  
  return stats;
}

generateStats();
