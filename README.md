# Eryndor — The Living World Bible & Complete Source Vault

A zero-dependency, phone-friendly GitHub Pages website for the Eryndor fantasy world. Public readers may browse and search; only the GitHub repository owner and any authorized collaborators can publish updates.


## FULL SOURCE IMPORT — 2026-11-21

**All 54 Eryndor source pages discoverable in the connected Notion workspace are archived in full**, totaling 2,118,797 bytes. They include the original World Bible, the original Compendium, Edition II and its chapter sources, Living Atlases, cultural chapters, population registers, the complete recovered Gloin chronicles and Second Age annals. **This is not a summary-only import.**

- **Website reader:** [Complete Source Vault](./vault.html) — browse source collections, read the complete text, switch to exact original markup, or full-text-search all source pages.
- **Full provenance checklist:** [SOURCE-INVENTORY.md](./SOURCE-INVENTORY.md) — all 54 page titles and direct GitHub source links.
- **Canonical working index:** [data/world.json](./data/world.json) — 149 organized worldbuilding records plus links into the full archive.
- **Source files:** [data/source-vault](./data/source-vault) — one unabridged recovered Notion source body per document; [source-vault-index.json](./data/source-vault-index.json) catalogues them.

**Scope boundary:** Some original roleplay dialogue and attachments may never have been included in Notion; this archive cannot conjure those missing parts. Nor does copying older references automatically make outdated lore current canon. The recovered source bodies are preserved as historical evidence, and current canon is interpreted with explicit supersessions.

## Contents

- `index.html` — responsive website shell
- `styles.css` — dark stone, ink and gold design
- `app.js` — search, navigation, chronology, record detail pages, campaign ledger, continuity ledger, local draft desk and export/import
- `data/world.json` — **canonical working dataset** in a portable, versionable JSON format; 149 curated records at founding edition
- `favicon.svg`, `mountains.svg` — self-contained SVG assets
- `build_data.py` — optional initial dataset generator. **CAUTION:** Running this script regenerates the original seed JSON and would overwrite any later changes. Never run it on edited live data without a backup.

## Publish through GitHub Pages (free public site)

1. Sign into GitHub and create a **public** repository, for example `eryndor-world-bible`. Add a README or leave it empty. The repository must exist before the connected GitHub tooling can write site files.
2. Tell ChatGPT the repository's `owner/repo` name. With your connected GitHub app, the assistant can upload these exact site files and future updates (subject to repository permissions).
3. In your repository, go to **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. Your GitHub Pages address will generally be `https://USERNAME.github.io/REPO/`.
4. Wait for GitHub's deployment status. Visit the URL and test the search, navigation and data views.

A custom domain is optional. There is no hosting fee for a public GitHub Pages repository under the normal free service terms. GitHub Pages is **public**: keep private character secrets, personal information and credentials out of `data/world.json`.

## Important data rules

This is a condensed first import of prior Eryndor canon, not a claim that all legacy Compendium material has been copied verbatim or exhaustively reconciled. The original Sites website and any Notion copies are **not touched**. Their export and source-accurate dialogue can be merged carefully in later commits.

Canon classifications:
- `canon` — established and currently accepted
- `working` — new or revisable development
- `reported` — attributed claim, not proof
- `disputed` — conflicting accounts
- `open` — unresolved and genuinely undecided
- `superseded` — prior archived state no longer current
- `noncanon` — rejected or excluded idea

**Protected canon constraints:** Eryndor has a 50,000-km diameter and 60/40 water/land; Second Age is exactly 1,437 years and Avarran eras are Awakening/Wonder/Fire; Orcs are absent from Ages One and Two and created by southeastern Avarran dark mages in the Third Age; First Throne ancestry is genuinely undecided; Gloin remains paused Autumn Day 22 at approximately 11:25 AM at Hadrik's desk until player action.

## Editing without a server

Use the **Local Draft Desk** for browser-local edits. Those drafts live only in that specific device's browser and are **not** published or sent to GitHub. Export the complete JSON (`world.json`) to save a durable backup. Then update `data/world.json` in GitHub, or provide the file to ChatGPT and ask it to commit the update through the connected GitHub app. The published website then reflects changes when the new commit is served.

Visitors may use local drafts too; they cannot alter the published website merely by editing their browser copy. GitHub repository write permissions govern publication.

## Run locally

From the site folder:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. Opening `index.html` directly from a file URL may prevent the browser from fetching `data/world.json`.

## Licensing and ownership

No outside code packages, external images, web fonts, or build services are required. The world lore remains its creator's material. This project does **not** grant public edit rights to the repository.