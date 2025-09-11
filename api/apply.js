// api/apply.js
import sendgrid from "@sendgrid/mail";
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }
  const { name, email, phone, jobTitle } = req.body;
  // you can validate here

  try {
    await sendgrid.send({
      to: "your.email@domain.com",
      from: "verified.sender@domain.com",
      subject: `New Application for ${jobTitle}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
      `
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send application" });
  }
}
