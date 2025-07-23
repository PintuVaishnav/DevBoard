import fetch from "node-fetch";

export async function sendSlackNotification(webhookUrl: string, message: string) {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!res.ok) {
      console.error("❌ Slack error:", await res.text());
    }

    return res.ok;
  } catch (err) {
    console.error("❌ Slack send failed:", err);
    return false;
  }
}
