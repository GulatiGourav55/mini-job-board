// api/apply.js

import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, jobTitle } = req.body;

  if (!name || !email || !phone || !jobTitle) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await sendgrid.send({
      to: "your.email@domain.com",        // ← your email
      from: "verified.sender@domain.com",  // ← must be verified in SendGrid
      subject: `New application for ${jobTitle}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Job: ${jobTitle}
      `,
      html: `
        <h2>New Job Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Job:</strong> ${jobTitle}</p>
      `
    });

    return res.status(200).json({ message: "Application sent successfully" });
  } catch (error) {
    console.error("Apply error:", error);
    return res.status(500).json({ error: "Failed to send application" });
  }
}
