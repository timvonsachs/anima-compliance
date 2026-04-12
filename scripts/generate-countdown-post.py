#!/usr/bin/env python3
"""
generate-countdown-post.py
Liest wiki-mirror/audits/ + patterns/, extrahiert Daten für gestern,
schreibt JSON-Kontext für Haiku-Template-Filling.

Output: data/countdown-context.json
"""
import os, re, json, sys
from pathlib import Path
from datetime import date, timedelta

BASE = Path(__file__).parent.parent
AUDIT_DIR = BASE / "wiki-mirror" / "audits"
PATTERN_DIR = BASE / "wiki-mirror" / "patterns"
OUTPUT_FILE = BASE / "data" / "countdown-context.json"

def days_until_deadline():
    from datetime import date
    deadline = date(2026, 8, 2)
    return (deadline - date.today()).days

def parse_frontmatter(text):
    """Extrahiert YAML-Frontmatter als dict."""
    fm = {}
    lines = text.split('\n')
    in_fm = False
    for i, line in enumerate(lines):
        if i == 0 and line.strip() == '---':
            in_fm = True
            continue
        if in_fm and line.strip() == '---':
            break
        if in_fm and ':' in line:
            k, _, v = line.partition(':')
            fm[k.strip()] = v.strip()
    return fm

def extract_issue_from_audit(content):
    """Häufigstes Problem aus Audit-Inhalt."""
    lower = content.lower()
    if 'art. 52' in lower or 'artikel 52' in lower or 'transparenz' in lower:
        if 'fehlt' in lower or 'kein' in lower or 'missing' in lower:
            return 'Art. 52 Transparenz fehlt'
    if 'eskalation' in lower and ('fehlt' in lower or 'keine' in lower):
        return 'Keine Human Escalation'
    if 'datenlösch' in lower or 'löschfrist' in lower:
        return 'Datenlöschung undokumentiert'
    if 'high-risk' in lower or 'annex iii' in lower:
        return 'High-Risk nicht deklariert'
    if 'preis' in lower and ('falsch' in lower or 'fehlt' in lower):
        return 'Preis-Fehlinformation'
    if 'veraltet' in lower or 'roadmap' in lower:
        return 'Veraltete Feature-Angaben'
    return 'Art. 52 Transparenz fehlt'  # Default

def extract_branche_from_audit(content, fm):
    """Branche aus Frontmatter oder Inhalt."""
    # Direkt aus Frontmatter
    for key in ['branche', 'industry', 'vertical']:
        if key in fm:
            return fm[key]
    # Aus chatbot_typ
    lower = content.lower()
    if 'legaltech' in lower or 'rechtsanwalt' in lower or 'kanzlei' in lower or 'legal' in lower:
        return 'LegalTech'
    if 'fintech' in lower or 'bank' in lower or 'kredit' in lower or 'payment' in lower:
        return 'FinTech'
    if 'health' in lower or 'mediz' in lower or 'klinik' in lower:
        return 'HealthTech'
    if 'ecommerce' in lower or 'shop' in lower or 'produkt' in lower or 'versand' in lower:
        return 'E-Commerce'
    if 'saas' in lower or 'projektmanagement' in lower or 'software' in lower:
        return 'B2B SaaS'
    if 'hr' in lower or 'personal' in lower or 'bewerb' in lower:
        return 'HRTech'
    return 'B2B SaaS'

def get_accuracy_compliant(fm, content):
    """
    Gibt (accuracy_num, accuracy_denom, is_compliant) zurück.
    Compliant = accuracy >= 8/10 UND Art. 52 vorhanden.
    """
    # Aus Frontmatter
    acc = fm.get('accuracy', '')
    if acc:
        m = re.match(r'(\d+)/(\d+)', acc)
        if m:
            num, denom = int(m.group(1)), int(m.group(2))
            # Compliant: accuracy >= 80% UND kein kritisches Art.52-Problem
            has_transparency = 'transparenz' in content.lower() and \
                               ('vorhanden' in content.lower() or 'korrekt' in content.lower())
            compliant = (num / denom >= 0.8) and has_transparency
            return num, denom, compliant
    return None, None, False

def get_top_issue_from_patterns():
    """Häufigstes Problem aus allen Pattern-Dateien."""
    issue_counts = {}
    if not PATTERN_DIR.exists():
        return 'Art. 52 Transparenz fehlt'
    
    for f in PATTERN_DIR.glob('*.md'):
        content = f.read_text(encoding='utf-8')
        issue = extract_issue_from_audit(content)
        issue_counts[issue] = issue_counts.get(issue, 0) + 1
    
    if not issue_counts:
        return 'Art. 52 Transparenz fehlt'
    return max(issue_counts, key=issue_counts.get)

def main():
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    
    # Alle Audits lesen
    all_audits = []
    yesterday_audits = []
    
    if AUDIT_DIR.exists():
        for f in AUDIT_DIR.glob('*.md'):
            content = f.read_text(encoding='utf-8')
            fm = parse_frontmatter(content)
            
            # Echtheit prüfen (aus auto-auditor Skill)
            is_real = (
                content.count('\n') >= 30 and
                any(w in content.upper() for w in ['KORREKT', 'KEINE_ANTWORT', 'UNVOLLSTAENDIG',
                                                     'FALSCH', 'methodik:', 'accuracy'])
            )
            if not is_real:
                continue
            
            num, denom, compliant = get_accuracy_compliant(fm, content)
            audit_data = {
                'firma': fm.get('firma', f.stem),
                'datum': fm.get('datum', ''),
                'chatbot_typ': fm.get('chatbot_typ', fm.get('chatbot', 'Unbekannt')),
                'accuracy_num': num,
                'accuracy_denom': denom,
                'compliant': compliant,
                'branche': extract_branche_from_audit(content, fm),
                'top_issue': extract_issue_from_audit(content),
            }
            all_audits.append(audit_data)
            
            if fm.get('datum', '').startswith(yesterday):
                yesterday_audits.append(audit_data)
    
    # Stats
    total = len(all_audits)
    compliant_count = sum(1 for a in all_audits if a['compliant'])
    non_compliant = total - compliant_count
    
    # Gestern
    yesterday_total = len(yesterday_audits)
    yesterday_nc = sum(1 for a in yesterday_audits if not a['compliant'])
    
    # Branche gestern (häufigste oder erste)
    if yesterday_audits:
        branchen = [a['branche'] for a in yesterday_audits]
        branche = max(set(branchen), key=branchen.count)
        has_new_audits = True
    else:
        branche = 'keine'
        has_new_audits = False
    
    # Häufigstes Problem — aus gestrigen Audits wenn vorhanden, sonst patterns
    if yesterday_audits:
        issues = [a['top_issue'] for a in yesterday_audits]
        top_issue = max(set(issues), key=issues.count)
    else:
        top_issue = get_top_issue_from_patterns()
    
    ctx = {
        'datum': date.today().isoformat(),
        'yesterday': yesterday,
        'days_left': days_until_deadline(),
        'total_analyzed': total,
        'compliant_count': compliant_count,
        'non_compliant_total': non_compliant,
        'yesterday_total': yesterday_total,
        'yesterday_non_compliant': yesterday_nc,
        'branche': branche,
        'top_issue': top_issue,
        'has_new_audits': has_new_audits,
        'yesterday_audits': [a['firma'] + ' (' + a['branche'] + ')' 
                             for a in yesterday_audits],
    }
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(ctx, ensure_ascii=False, indent=2))
    
    print(json.dumps(ctx, ensure_ascii=False))
    return 0

if __name__ == '__main__':
    sys.exit(main())
