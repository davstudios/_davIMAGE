# GitHub setup

1. Usa la repository pubblica `_davIMAGE`.
2. Copia il contenuto del progetto nella root della repository senza eliminare la cartella locale `.git`.
3. Esegui `npm test` e, se desiderato, uno smoke test con `npm run desktop`.
4. In GitHub Desktop usa come Summary `_davIMAGE v26.10.2`.
5. Nella Description inserisci sempre la descrizione bilingue completa con una sezione `🇮🇹` e una sezione `🇺🇸`.
6. Fai Commit e **Push origin**.
7. Crea e pubblica il tag:

```bash
git tag -a v26.10.2 -m "Release _davIMAGE v26.10.2"
git push origin v26.10.2
```

La GitHub Action verifica che il tag corrisponda alla versione interna, legge automaticamente la Description del commit associato al tag e la usa come descrizione della GitHub Release. La pipeline compila i pacchetti Windows, macOS e Linux e li allega alla release.
