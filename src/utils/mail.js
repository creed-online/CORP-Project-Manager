import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
   const mailGenerator =  new Mailgen({
        theme: "default",
        product: {
            name: "CORP",
            link: "https://CORP.com/"
        }
    });

    const eamilTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const eamilHtml = mailGenerator.generate(options.mailgenContent);

   const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });

    const mail = {
        from: "varunkumarsaxena26@gmail.com",
        to: options.to,
        subject: options.subject,
        text: eamilTextual,
        html: eamilHtml
    };
    try {
    await transporter.sendMail(mail);
    } catch (error) {
             console.error("Error sending email:", error);       
        }
}

const emamilVerificationMailgenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to CORP! We're very excited to have you on board.",
            action: {
                instructions: "Click the button below to verify your email address:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Verify Email",
                    link: verificationURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}


const forgotPasswordMailgenContent = (username, passwordResetURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to CORP! We got a request to reset your password. You can reset your password by clicking the button below.",
            action: {
                instructions: "Click the button below to reset your password:",
                button: {
                    color: "#257548", // Optional action button color
                    text: "Reset Password",
                    link: passwordResetURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export { emamilVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail }