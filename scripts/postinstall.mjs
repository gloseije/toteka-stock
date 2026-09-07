#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(cmd, args, pipe = false) {
    const result = spawnSync(cmd, args, {
        stdio: pipe ? ["ignore", "pipe", "pipe"] : "inherit",
        shell: process.platform === "win32",
        encoding: "utf8",
    });
    if (!pipe && result.status !== 0) {
        process.exit(result.status ?? 1);
    }
    return result;
}

// Génère le client Prisma (nécessaire pour le build)
run("npx", ["prisma", "generate"]);

// En environnement Vercel/CI avec DATABASE_URL, applique les migrations
// pour que le déploiement ait toujours la dernière version du schéma.
if (process.env.VERCEL === "1" && process.env.DATABASE_URL) {
    // Vérifie s'il y a des migrations en attente avant de déployer.
    // `prisma migrate status` est conçu pour cela : il liste les migrations
    // appliquées et sort en code 0 si tout est à jour.
    const status = run("npx", ["prisma", "migrate", "status"], true);
    const output = `${status.stdout ?? ""}\n${status.stderr ?? ""}`;

    const hasPending =
        /pending migrations|migrations en attente|migrations not applied/i.test(output);
    const isUpToDate = /up to date|à jour|no pending migrations/i.test(output);

    if (!status.error && !hasPending && isUpToDate) {
        console.log("[postinstall] Prisma schema up to date, skipping migrate deploy.");
    } else {
        console.log("[postinstall] Pending migrations detected, running migrate deploy...");
        run("npx", ["prisma", "migrate", "deploy"]);
    }
} else {
    console.log("[postinstall] migrations skipped (not Vercel or no DATABASE_URL)");
}
