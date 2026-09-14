import "server-only";
import { Resend } from "resend";

export interface SendRfqEmailsParams {
  to: string;
  publicId: string;
  contactName: string;
  companyName: string;
  serviceLineName: string;
  phone: string;
  location: string;
  scope: string;
  desiredStart?: string;
}

export async function sendRfqEmails(params: SendRfqEmailsParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.log(`[RFQ ${params.publicId}] email skipped: no key`);
    return;
  }

  const from = process.env.EMAIL_FROM || "OCNKS Global <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  try {
    // 1. Email to Submitter
    const submitterHtml = `
      <div style="font-family: sans-serif; color: #063d1f; max-width: 600px; margin: 0 auto; border: 1px solid #0d7a3f22; padding: 24px; borderRadius: 8px; background-color: #f4f7f5;">
        <h2 style="color: #0d7a3f; margin-top: 0;">Request for Quotation Received</h2>
        <p>Dear ${params.contactName},</p>
        <p>Thank you for reaching out to OCNKS Global Ltd. Your request for quotation has been received and logged successfully.</p>

        <div style="background-color: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #0d7a3f33; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #063d1f;"><strong>Reference Number:</strong></p>
          <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #0d7a3f;">${params.publicId}</p>
        </div>

        <p><strong>Service Line:</strong> ${params.serviceLineName}</p>

        <p>Our engineering and procurement team will review your specifications and contact you shortly via the provided details.</p>

        <hr style="border: none; border-top: 1px solid #0d7a3f22; margin: 24px 0;" />

        <p style="font-size: 12px; color: #063d1f99;">
          OCNKS GLOBAL LTD<br/>
          Port Harcourt · Abuja · Nigeria<br/>
          Email: ocnksglobal@gmail.com · Phone: +234 810 869 0772
        </p>
      </div>
    `;

    await resend.emails.send({
      from,
      to: params.to,
      replyTo: "ocnksglobal@gmail.com",
      subject: `[${params.publicId}] Quotation Request Received - OCNKS Global Ltd`,
      html: submitterHtml,
    });

    // 2. Internal Notification Email to OCNKS Global Team
    const internalHtml = `
      <div style="font-family: sans-serif; color: #063d1f; max-width: 600px; margin: 0 auto; border: 1px solid #0d7a3f22; padding: 24px; borderRadius: 8px;">
        <h2 style="color: #0d7a3f; margin-top: 0;">New RFQ Submitted: ${params.publicId}</h2>

        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <tr><td style="padding: 6px 0; font-weight: bold;">Reference:</td><td>${params.publicId}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Contact Name:</td><td>${params.contactName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Company:</td><td>${params.companyName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td>${params.to}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Phone:</td><td>${params.phone}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Service Line:</td><td>${params.serviceLineName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Location:</td><td>${params.location}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Desired Start:</td><td>${params.desiredStart || "Not specified"}</td></tr>
        </table>

        <div style="margin-top: 16px; background-color: #f4f7f5; padding: 12px; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #063d1f;">Scope of Work:</h4>
          <p style="margin: 0; white-space: pre-wrap; font-size: 13px;">${params.scope}</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from,
      to: "ocnksglobal@gmail.com",
      replyTo: params.to,
      subject: `[NEW RFQ] ${params.publicId} - ${params.companyName} (${params.serviceLineName})`,
      html: internalHtml,
    });
  } catch (error) {
    console.error(`[RFQ ${params.publicId}] Failed to send email notifications:`, error);
  }
}
