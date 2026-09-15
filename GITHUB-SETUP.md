# GitHub setup

1. Crea una repository chiamata `_davIMAGE`.
2. Copia il contenuto di questo progetto nella root della repository.
3. Esegui `npm test` e prova l'app con `npm run desktop`.
4. Fai commit e push.
5. Per creare la release automatica crea il tag `v1.0.0` e pubblicalo:

```bash
git tag -a v1.0.0 -m "Release _davIMAGE v1.0.0"
git push origin v1.0.0
```

La GitHub Action creerà i pacchetti Windows, macOS e Linux e li allegherà alla release.
