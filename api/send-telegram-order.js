export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || '8522043344';

  if (!botToken) {
    return res.status(500).json({
      ok: false,
      error: 'TELEGRAM_BOT_TOKEN environment variable is not configured'
    });
  }

  let payload = req.body;

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      return res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
    }
  }

  const message = String(payload?.message || '').trim();

  if (!message) {
    return res.status(400).json({ ok: false, error: 'Message is required' });
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const telegramResult = await telegramResponse.json().catch(() => null);

    if (!telegramResponse.ok || !telegramResult?.ok) {
      return res.status(502).json({
        ok: false,
        error: 'Telegram API request failed',
        details: telegramResult
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Unable to send Telegram message',
      details: error?.message || String(error)
    });
  }
}
