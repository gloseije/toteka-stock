import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { ensureTrialSubscription } from "./subscription";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    databaseHooks: {
        user: {
            create: {
                // Crée l'abonnement d'essai de 14 jours dès l'inscription
                after: async (user) => {
                    await ensureTrialSubscription(user.id, new Date(user.createdAt));
                },
            },
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    emailVerification: {
        sendOnSignUp: false, // Désactivé temporairement pour tester l'inscription
        autoSignInAfterVerification: true,
        sendEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
            await sendEmail({
                to: user.email,
                subject: "Vérifiez votre adresse email",
                text: `Cliquez sur ce lien pour vérifier votre email : ${url}`,
                html: `<p>Cliquez sur <a href="${url}">ce lien</a> pour vérifier votre email.</p>`,
            });
        },
    },
    passwordReset: {
        sendEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
            await sendEmail({
                to: user.email,
                subject: "Réinitialisation de votre mot de passe",
                text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${url}`,
                html: `<p>Cliquez sur <a href="${url}">ce lien</a> pour réinitialiser votre mot de passe.</p>`,
            });
        },
    },
});
