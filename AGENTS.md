<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

# Règles de design Toteka

Ces règles s'appliquent à toutes les pages, composants et itérations du projet.
Elles ont priorité sur toute suggestion esthétique générique.

---

## Couleurs

- Palette principale : **purple** (violet saturé, ex. Tailwind `purple-*`)
- Référence : `purple-600` (#7C3AED) comme couleur primaire, `purple-900` (#4C1D95) pour les fonds sombres, `purple-50` (#F5F3FF) pour les fonds clairs
- Ne pas utiliser : amber, orange, teal, rouge ou toute couleur secondaire non validée
- Ne pas créer de **dégradés dans les textes** (`bg-clip-text`, `text-transparent`)

---

## Boutons

- Border-radius **léger uniquement** : `rounded` (4px) ou `rounded-md` (6px) maximum
- Jamais de `rounded-xl`, `rounded-2xl`, `rounded-full` sur les boutons
- Taille **normale** : padding `px-4 py-2` ou `px-5 py-2.5`, pas de boutons XXL hero
- Pas de `box-shadow` coloré ou glow sur les boutons
- Variantes autorisées : plein (primary), outline, ghost — c'est tout

---

## Contenu

- **Zéro faux chiffres** : pas de stats inventées ("87% des vendeurs…", "3× moins d'erreurs")
- **Zéro faux avis / témoignages** non réels
- **Zéro badges** marketing ("Le plus populaire", "Recommandé", "⭐ 4.9/5")
- **Zéro mockups de téléphone** ou cartes de dashboard générés en CSS/JSX
- Utiliser de **vraies images** (Unsplash ou assets réels) plutôt que des illustrations codées

---

## Typographie

- Pas de dégradés sur les textes
- Hiérarchie claire : un seul niveau `font-bold` par section (le titre), le reste en `font-semibold` ou normal
- Ne pas abuser de `tracking-tight` ou `text-5xl+` partout — réserver aux vrais titres de section

---

## Structure des sections

- Hero : titre + sous-titre + max 2 CTAs + image réelle
- Pas de section "stats" avec des chiffres inventés
- Features : grille simple, texte honnête sur ce que le produit fait
- Pricing : plans clairs, sans badge de mise en valeur artificielle
- CTA final : fond coloré simple, une seule action

---

## Styles

- **Zéro propriété `style` inline** dans les balises JSX/TSX (`style={{ ... }}` est interdit)
- Utiliser exclusivement des classes **Tailwind CSS**
- Sur mobile, privilégier les espacements `px-4` plutôt que `px-6` pour les conteneurs, sections et menus
- Les valeurs hors palette Tailwind (couleurs custom) passent par des variables CSS définies dans `globals.css` ou via `tailwind.config`

---

## Conventions de code

- Utiliser `React.SubmitEvent` au lieu de `React.FormEvent` (déprécié) pour les gestionnaires de soumission de formulaire (`onSubmit`).
- **Zéro type `any`** : toujours typer explicitement les variables, paramètres et retours de fonction. Utiliser `unknown` si le type est réellement inconnu, ou définir des interfaces/types précis.

---

## Typographie française

- **Pas de longs tirets** (—, em dash) dans les textes : utiliser le deux-points (` : `) ou reformuler
- Espaces insécables avant ` :`, ` ;`, ` !`, ` ?` (`&nbsp;` en HTML ou `\u00A0` en JS)

---

## À ne jamais faire

- `bg-gradient-to-* text-transparent bg-clip-text`
- Mockups codés (téléphone, browser, dashboard) simulant l'UI du produit
- Données inventées présentées comme réelles
- Emojis dans les titres de section
- Sections "Ils nous font confiance" avec logos ou avis fictifs

<!-- END:nextjs-agent-rules -->
