---
firma: JUPUS GmbH
datum: 2026-04-10
chatbot_typ: HubSpot (kein Live-Chat-Widget aktiv — nur Marketing-Tracking)
accuracy: 3/5
staerkster_fund: "JUPUS-KI bewertet Mandate als lukrativ oder nicht — ohne Transparenz über die Entscheidungslogik"
methodik: FAQ-Analyse + Website-Audit (kein Live-Chat verfügbar)
eu_ai_act_relevanz: "High-Risk: Automatisierte KI-Empfehlungen beeinflussen Zugang zu Rechtsberatung (Annex III)"
---

# Mini-Audit: JUPUS GmbH

**Datum:** 2026-04-10
**Chatbot:** HubSpot-Script geladen (`js-eu1.hs-scripts.com/27212211.js`) — aber kein Chat-Widget aktiv auf jupus.de
**Methodik:** FAQ-Analyse + Website-Inhaltsaudit (kein interagierbarer Bot auf der Website)
**Accuracy:** 3/5 (3 korrekt, 1 unvollständig, 1 kein Antwort)

---

## Was JUPUS macht (Produktverständnis)

JUPUS verkauft ein KI-System für Rechtsanwaltskanzleien:
- **KI-Chatbot** auf Kanzlei-Websites — erkennt Mandatsanfragen, fragt Infos ab
- **KI-Assistent** — bewertet ob ein Mandat "lukrativ" ist, schlägt Antworten vor
- **Telefon-KI (Marie)** — nimmt Anrufe entgegen, erkennt Anliegenr
- **Dokumenten-KI** — extrahiert Infos aus Dokumenten, generiert Schriftsätze

Preise: €97/Nutzer/Monat + €97 Plattformgebühr (min. €194/Monat für 1 Nutzer)
Integrations: DATEV, Advoware, Actaport, WinMacs, HubSpot, Kleos

---

## 5 Test-Fragen und Bewertung

| # | Kategorie | Frage | Antwort aus Website/FAQ | Bewertung |
|---|-----------|-------|------------------------|-----------|
| 1 | Pricing | Was kostet JUPUS pro Monat? | €97/Nutzer + €97 Plattformgebühr = min. €194/Monat | ✅ KORREKT — klar auf Website |
| 2 | Compliance | Ist JUPUS DSGVO-konform? | "Nur zertifizierte EU-Server, DSGVO + BRAO konform" | ⚠️ UNVOLLSTÄNDIG — keine Zertifizierungsnummer, kein Hinweis auf EU AI Act |
| 3 | Feature | Kann die KI meinen Mandanten rechtlich beraten? | Nicht in FAQ beantwortet | ❌ KEIN ANTWORT — kritischer Gap |
| 4 | Transparenz | Wie entscheidet die KI ob ein Mandat lukrativ ist? | "Sie wissen auf den ersten Blick ob eine Anfrage lukrativ ist" | ❌ INTRANSPARENT — keine Erklärung der Entscheidungslogik |
| 5 | Datenschutz | Was passiert mit Mandantendaten wenn ich JUPUS verlasse? | Nicht beantwortet | ⚠️ UNVOLLSTÄNDIG — nur "EU-Server" erwähnt |

**Accuracy: 3/5 (1 korrekt, 2 unvollständig, 2 keine Antwort)**

---

## Kritischer Fund

**JUPUS-KI bewertet automatisch ob ein Mandat "lukrativ" ist — ohne Transparenz über die Entscheidungslogik.**

Konkrete Aussage auf Website:
> *"Sie wissen auf den ersten Blick, ob eine Anfrage lukrativ ist. Ihnen liegen in jeder neuen Anfrage sofort alle Informationen und Dokumente vor, die Sie für eine Bewertung der Anfrage benötigen."*

Und:
> *"Durch fehlende Vorfilterung stecken Sie jeden Tag aufs Neue Zeit und Arbeit in die Erforschung und Aufnahme von unlukrativen Anfragen."*

**Warum das ein Problem ist:**
JUPUS' KI filtert Mandate vor — Menschen mit "unlukrativen" Anliegen (z.B. wenig Geld, komplexe Fälle) könnten systematisch deprioritisiert werden. Das beeinflusst den Zugang zu Rechtsberatung. Eine KI die das automatisiert entscheidet = EU AI Act Hochrisiko-System.

---

## Email-Hook (Plantura-Formel)

**Betreff:** "Wenn euer KI-Assistent ein Mandat als unlukrativ klassifiziert"

**Erster Satz für Follow-up:**
*"JUPUS' KI entscheidet automatisch welche Mandatsanfragen lukrativ sind — ohne zu dokumentieren wie diese Entscheidung getroffen wird. Das ist EU AI Act Annex III, und ihr habt keinen Compliance-Nachweis dafür."*

---

## EU AI Act Relevanz

**Artikel/Annex:** Annex III Nr. 1 (b) — KI-Systeme die natürliche Personen für den Zugang zu wichtigen Dienstleistungen bewerten
Und evtl. Annex III Nr. 5 — Kreditwürdigkeitsbewertung (wenn "lukrativ" finanzielle Entscheidungen impliziert)

**Warum High-Risk:**
- KI entscheidet (oder empfiehlt stark) ob ein Mandant rechtliche Hilfe bekommt
- Zugang zu Rechtsberatung = wichtige Dienstleistung (Art. 6 ECHR)
- Keine Dokumentation der Entscheidungslogik auf Website
- "BRAO-konform" erwähnt, EU AI Act komplett ignoriert

**Pflichten ab August 2026:**
- Konformitätsbewertung (Annex VI)
- Technische Dokumentation
- Human-Oversight-Nachweis
- Transparenz gegenüber Nutzern über KI-Entscheidungen

---

## Bonus-Finding: Telefon-KI ohne Transparenz-Hinweis

JUPUS bietet "Marie" — eine Telefon-KI die Anrufe entgegennimmt, Anliegen versteht und Informationen abfragt. Auf der Marie-Seite (marie.jupus.de) kein Hinweis dass der Anrufer mit einer KI spricht.

EU AI Act Art. 52 (1): KI-Systeme die Menschen täuschen könnten sind mit menschlichen Interaktionen zu interagieren — **Transparenzpflicht**.

---

## Links

[[leads/jupus]] · [[eu-ai-act]] · [[legaltech]]
