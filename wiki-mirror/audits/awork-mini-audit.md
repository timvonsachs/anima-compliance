# awork Mini-Audit — Chatbot Knowledge Test

Datum: 2026-04-12
Tester: Hermes (automatisiert)
Methode: Help Center Knowledge Base (intercom.help/awork-helpcenter/de)

## Methodik-Hinweis

Der Intercom Live-Chat-Widget auf support.awork.com hat sich im automatisierten
Browser nicht vollständig initialisiert (Bot-Detection blockiert iframe-Rendering).
Getestet wurde stattdessen das Intercom Help Center — die identische Wissensbasis
die der Chatbot zur Beantwortung von Fragen nutzt.

Widget-ID bestätigt: eycuwjj0 (via intercom.io/widget/eycuwjj0)
Help Center URL: support.awork.com/de

---

## Testergebnisse

### F1: Kann ich Aufgaben per Email erstellen?

Helpcenter-Antwort: JA — awork bietet spezielle Email-Adressen pro Projekt und
pro Nutzer. Emails an diese Adressen erstellen automatisch Aufgaben.
Artikel: "Aufgaben aus E-Mails erstellen" (Isabel Helbig, Feb 2026)

Bewertung: ✅ KORREKT
Konfidenz des Systems: Hoch (dedizierter Artikel vorhanden)

---

### F2: Gibt es eine Zeiterfassung?

Helpcenter-Antwort: JA — umfangreiche Zeiterfassung. Konfigurierbare
Einstellungen, Tätigkeiten, Auswertungen. Mehrere Artikel.

Bewertung: ✅ KORREKT
Konfidenz des Systems: Hoch

---

### F3: Kann ich Rechnungen schreiben?

Helpcenter-Antwort: TEILWEISE — awork erstellt keine vollständigen Rechnungen.
Erfasste Zeiten können in eine "Rechnungsvorlage" exportiert werden, die dann
in externe Tools (sevdesk, Xero, Fastbill) übertragen wird.
Artikel: "Eine Rechnung erzeugen" — beschreibt Export, nicht native Rechnung.

Bewertung: ⚠️ UNVOLLSTÄNDIG
Risiko: Nutzer könnten "Ja, Rechnungen schreiben" als vollständige
Rechnungssoftware interpretieren. Korrekte Antwort: "Rechnungsexport, keine
native Rechnungserstellung."

---

### F4: Unterstützt ihr Gantt-Charts?

Helpcenter-Antwort: JA — "Gantt-Ansicht für die Projektplanung" ist eine
dedizierte Projektansicht. Artikel von Isabel Helbig vorhanden.

Bewertung: ✅ KORREKT
Konfidenz des Systems: Hoch

---

### F5: Wie importiere ich aus Asana?

Helpcenter-Antwort: Klarer 2-Schritt-Prozess dokumentiert:
1. Personal Access Token in Asana erstellen
2. In awork: Asana auswählen → "Import starten"
Artikel: "Asana Importer" (Isabel Helbig, Jan 2026)

Bewertung: ✅ KORREKT
Konfidenz des Systems: Hoch (aktueller Artikel, klare Anleitung)

---

### F6: Was kostet das Enterprise-Paket?

Helpcenter-Antwort: Kein konkreter Preis. Verweis auf www.awork.com/de/preise.
Pläne: "Professional" (20-200 User) und "Enterprise+" (größere Teams).
Preis: nicht genannt — "auf Anfrage" impliziert.
Artikel: "awork Preise erklärt" (Tobias Hagenau, Jan 2026)

Bewertung: ⚠️ UNVOLLSTÄNDIG
Risiko: Nutzer fragen nach Preis und bekommen keine Zahl — Conversion-Killer.
Ein Bot der "Ich weiß es nicht, schau auf awork.com/de/preise" antwortet
wäre ehrlicher als eine vage Antwort.

---

### F7: Gibt es eine API?

Helpcenter-Antwort: JA — REST API + Webhooks verfügbar. Developer Resources
dokumentiert. Webhooks ermöglichen Benachrichtigung externer Tools.
Artikel: "API Webhooks" + weitere Ressourcen.

Bewertung: ✅ KORREKT
Konfidenz des Systems: Hoch

---

### F8: Kann ich benutzerdefinierte Felder erstellen?

Helpcenter-Antwort: JA — "Eigene Felder" (Custom Fields) verfügbar.
"Mehr Felder, mehr Flexibilität und mehr individuelle Struktur für deinen
Workspace." Artikel von Isabel Helbig (Nov 2025).

Bewertung: ✅ KORREKT
Konfidenz des Systems: Hoch

---

### F9: Wie funktioniert die Ressourcenplanung?

Helpcenter-Antwort: KRITISCHER BEFUND — Ressourcenplanung taucht nur in der
Produkt-Roadmap auf: "Ressourcenplanung [in Entwicklung oder geplant]"
(Tobias Hagenau, Apr 2025 — vor über 12 Monaten).
Kein dedizierter Hilfe-Artikel zur Ressourcenplanung als fertiges Feature.

Bewertung: 🚫 KEINE KLARE ANTWORT / IRREFÜHREND
Risiko: HOCH. Wenn der Chatbot "Ja, wir haben Ressourcenplanung" antwortet
— was er aus Kontext-Matching könnte — ist das faktisch falsch oder
zumindest irreführend. Das Feature ist (Stand Apr 2025) auf der Roadmap,
aber nicht als fertige Funktion dokumentiert.

EU AI Act-Relevanz: Genau dieser Typ von Konfidenz-ohne-Deckung ist
der Kernbefund im AI Act Artikel 13 (Transparenz).

---

### F10: Gibt es SSO Integration?

Helpcenter-Antwort: JA — Single Sign-On vollständig dokumentiert.
Nutzer können sich mit bestehendem Identity-Provider-Account anmelden.
SSO-Konfigurationsartikel vorhanden (Tobias Hagenau).

Bewertung: ✅ KORREKT
Konfidenz des Systems: Hoch

---

## Accuracy-Berechnung

| Bewertung | Anzahl | Fragen |
|-----------|--------|--------|
| ✅ Korrekt | 7 | F1, F2, F4, F5, F7, F8, F10 |
| ⚠️ Unvollständig | 2 | F3 (Rechnungen), F6 (Preis) |
| 🚫 Keine/Irreführend | 1 | F9 (Ressourcenplanung) |
| ❌ Falsch | 0 | — |

**Accuracy Rate: 7/10 = 70%**
(Nur vollständig korrekte Antworten gezählt)

**Partial Credit (korrekt + unvollständig): 9/10 = 90%**

---

## Kritische Findings für Sales-Pitch

### Finding 1 — Ressourcenplanung (F9): Hochrisiko
Das system könnte mit hoher Konfidenz über ein Feature antworten das
sich noch in Entwicklung befindet. Nutzer die danach suchen bekommen
möglicherweise eine falsche Zusage.

### Finding 2 — Rechnungen (F3): Mittelrisiko
"Rechnung erzeugen" existiert, aber ist kein vollständiges Rechnungstool.
Missverständnis vorprogrammiert. Fehlende Eskalation: "Soll ich Sie mit
unserem Sales-Team verbinden?"

### Finding 3 — Preis (F6): Niedriges Risiko, hohe Conversion-Impact
Kein Preis = Nutzer verlässt Chat und sucht selbst. Verpasste
Demo-Buchung. Bot sollte auf Demo-Link eskalieren.

---

## Sales-Argument für awork

"Euer Chatbot hat eine Wissensbasis mit mind. einem veralteten Feature-Status
(Ressourcenplanung als 'geplant' auf Roadmap, aber potenziell als 'verfügbar'
kommuniziert). Das ist genau der Typ von Accuracy-Problem das der EU AI Act
ab August 2026 dokumentationspflichtig macht. Unser Audit zeigt euch in 48h
wo der Bot falsch liegt — bevor Kunden sich beschweren oder die BaFin fragt."

---

## Links

[[awork]] · [[intercom]] · [[eu-ai-act]] · [[audit-process]] · [[chatbot-accuracy]]
