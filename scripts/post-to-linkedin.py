#!/usr/bin/env python3
"""
post-to-linkedin.py
Liest den letzten Countdown-Post aus wiki-mirror/content/countdown/
und gibt ihn clipboard-ready aus.

Aufruf: python3 scripts/post-to-linkedin.py [--date YYYY-MM-DD]
"""
import sys, os
from pathlib import Path
from datetime import date

BASE = Path(__file__).parent.parent
COUNTDOWN_DIR = BASE / "wiki-mirror" / "content" / "countdown"

def extract_post_text(md_content):
    """Extrahiert den Post-Text zwischen ## Post-Text und ## Kontext."""
    lines = md_content.split('\n')
    in_post = False
    post_lines = []
    for line in lines:
        if '## Post-Text' in line:
            in_post = True
            continue
        if in_post and line.startswith('## '):
            break
        if in_post:
            post_lines.append(line)
    return '\n'.join(post_lines).strip()

def main():
    target_date = None
    if '--date' in sys.argv:
        idx = sys.argv.index('--date')
        target_date = sys.argv[idx + 1]
    
    # Neueste Datei finden
    if not COUNTDOWN_DIR.exists():
        print("ERROR: Kein countdown-Verzeichnis gefunden.", file=sys.stderr)
        sys.exit(1)
    
    files = sorted(COUNTDOWN_DIR.glob('*.md'), reverse=True)
    if not files:
        print("ERROR: Keine Post-Dateien gefunden.", file=sys.stderr)
        sys.exit(1)
    
    target_file = None
    if target_date:
        for f in files:
            if f.stem.startswith(target_date):
                target_file = f
                break
    else:
        target_file = files[0]  # Neueste
    
    if not target_file:
        print(f"ERROR: Keine Datei für {target_date} gefunden.", file=sys.stderr)
        sys.exit(1)
    
    content = target_file.read_text(encoding='utf-8')
    post_text = extract_post_text(content)
    
    if not post_text:
        print("ERROR: Post-Text nicht extrahierbar.", file=sys.stderr)
        sys.exit(1)
    
    # In Clipboard kopieren (macOS)
    try:
        import subprocess
        proc = subprocess.run(['pbcopy'], input=post_text.encode('utf-8'), check=True)
        print(f"✅ Post in Clipboard kopiert ({len(post_text)} Zeichen)")
        print(f"   Datei: {target_file.name}")
        print()
    except Exception as e:
        print(f"Clipboard-Fehler: {e}")
    
    # Text ausgeben
    print("=" * 60)
    print(post_text)
    print("=" * 60)
    print()
    print("→ Jetzt auf linkedin.com/feed einfügen und posten.")
    
    # Status in Datei auf "posted" setzen
    updated = content.replace('status: draft', f'status: posted\ngepostet_am: {date.today().isoformat()}')
    target_file.write_text(updated, encoding='utf-8')
    print(f"✅ Status in {target_file.name} auf 'posted' gesetzt.")

if __name__ == '__main__':
    main()
