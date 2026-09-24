"""Tiny Nastaliq subsets for the few Urdu words shown on English pages (tagline, "محلہ کامرس", "اردو").
The full font (~320 KB) then only downloads on the Urdu page. Re-run after changing Urdu text on English pages:
    pip install fonttools brotli && python scripts/subset-urdu.py
"""
import pathlib, re, subprocess

root = pathlib.Path(__file__).resolve().parent.parent
src = ''.join((root / f).read_text('utf-8') for f in ['src/components/Landing.tsx', 'src/components/LangSwitch.tsx'])
chars = ''.join(sorted(set(re.findall(r'[؀-ۿ‌-‎]', src)))) + ' ،—'
for w in (400,):  # one weight is enough for a few words; declared for 400–800 so bold isn't faked
    subprocess.run(['pyftsubset', str(root / f'node_modules/@fontsource/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-{w}-normal.woff2'),
                    f'--text={chars}', '--layout-features=*', '--flavor=woff2', f'--output-file={root / f"src/fonts/nastaliq-lite-{w}.woff2"}'], check=True)
    print(w, (root / f'src/fonts/nastaliq-lite-{w}.woff2').stat().st_size, 'bytes')
