"use server";

import { resend } from "@/lib/resend";

export async function sendWelcomeEmail(recipientEmail, userName) {
  try {
    const response = await resend.emails.send({
      from: "Onboarding <onboarding@resend.dev>", // Replace with your verified domain in production
      to: recipientEmail,
      subject: "Welcome to Wealth!",
      html: `<p>Hi ${userName}, thanks for joining!</p>`,
    });

    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}