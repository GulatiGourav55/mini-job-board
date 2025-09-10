// netlify/functions/apply.js
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { name, email, phone, jobId, jobTitle } = JSON.parse(event.body);

    await sendgrid.send({
      to: "gulatigourav1991@gmail.com", // 👈 your email
      from: "noreply@yourdomain.com",   // 👈 must be verified in SendGrid
      subject: `New application for ${jobTitle}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Job ID: ${jobId}
      `,
      html: `
        <h2>New Job Application</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Job:</b> ${jobTitle} (ID: ${jobId})</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Application sent" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send application" }),
    };
  }
};
