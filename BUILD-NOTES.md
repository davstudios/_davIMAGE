# Build notes — _davIMAGE v26.10.3

## Requisiti

- Node.js LTS
- npm
- Rust 1.85 o superiore
- prerequisiti Tauri 2 della piattaforma

## Test

```bash
npm test
```

## Sviluppo desktop

```bash
npm install --no-audit --no-fund
npm run desktop
```

## Bundle

```bash
npm run bundle
```

La v26.10.3 mantiene invariati il motore immagini locale, il backend Rust e i comportamenti della precedente release. Questa release completa la repository normalization dei file testuali, applica regole EOL deterministiche e rafforza la sincronizzazione della versione includendo package-lock.json e Cargo.lock con compatibilità LF/CRLF.

## Metadata bundle

- Publisher: `_davstudios`
- Homepage: `https://davstudios.it`
- License: `MIT`
- Copyright: `© 2026 _davstudios`
- Identifier preservato: `studio.dav.image`
- Categoria: `GraphicsAndDesign`
- Debian section: `graphics`

## Firma

Le release attuali non usano certificati commerciali di firma Windows né Developer ID/notarizzazione Apple. Il README contiene le istruzioni per gli utenti che incontrano SmartScreen o Gatekeeper.

## Limitazioni correnti

L'elaborazione delle GIF animate resta intenzionalmente non disponibile per evitare perdita di frame. I file HEIC/HEIF vengono rilevati, ma il supporto codec completo non è incluso. L'ispezione metadata è attualmente in sola lettura.

## Icone bundle

Il set di icone Tauri esistente viene preservato senza modifiche.

