import nodemailer from "nodemailer";
// import { Resend } from "resend";
import { render } from "@react-email/render";
import { Session } from "../lib/auth-client";
import { VerificationEmailTemplate } from "./verificationEmailTemplate";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async (url:string, user:Session) => {
//     await resend.emails.send({
//     from: "onboarding@resend.dev",
//     to: ['deliver@resend.dev'],
//     subject: "Verify your email address",
//     react: VerificationEmailTemplate({ url, name: user.name})
// })

// }

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export const sendEmail = async (url: string, user: Session) => {
    try {
        // CORRECT: Await the render function to get the final string.
        // The 'render' function from @react-email/render is synchronous,
        // but if you have a custom async wrapper, you must await it.
        const emailHtml: string = await render(VerificationEmailTemplate({ url, name: user.name }));

        // Now, `emailHtml` is a string, which matches what Nodemailer expects.
        const options = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: "Verify your email address",
            html: emailHtml, // This is now a 'string', not a 'Promise<string>'
        };

        await transporter.sendMail(options);
        console.log("Verification email sent successfully!");

    } catch (error) {
        console.error("Failed to send email:", error);
        throw new Error("Email could not be sent.");
    }
};