# Toteka Stock

## Règles métier importantes

### Vente issue d'une commande

- Une vente ne peut pas être modifiée librement si elle dépend d'une commande.
- La vente est un reflet de l'état de la commande à la conversion.
- Si la commande est modifiée, supprimée ou mise à jour dans un statut indiquant que la vente n'a pas abouti, la vente associée doit être mise à jour ou supprimée en conséquence.
- En pratique : les données d'une vente dérivée d'une commande sont soumises à la logique de la commande et ne doivent pas être traitées comme une vente autonome.
- Si un changement de statut de commande montre que la vente n'a pas abouti, la vente liée doit être invalidée, corrigée ou supprimée selon le cas métier.

### Règle de conception

- Cette règle doit être documentée dans la logique métier et la base de données, et non dans le frontend.
- Toute évolution fonctionnelle autour de la conversion commande → vente doit respecter cette dépendance et empêcher les modifications incohérentes entre les deux entités.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
