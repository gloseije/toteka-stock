import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
}: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        // On ne relance pas l'erreur pour ne pas bloquer le processus d'auth
        // en cas de problème de configuration SMTP en développement.
    }
};
