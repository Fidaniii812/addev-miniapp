export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, packageType, starCost, amountToAdd } = req.body;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'Bot token not configured on server' });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: packageType,
        description: `Purchase ${packageType} in AdDev Rewards`,
        payload: JSON.stringify({ userId, amountToAdd }),
        currency: 'XTR',
        prices: [{ label: packageType, amount: starCost }]
      })
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to create invoice link from Telegram');
    }

    return res.status(200).json({ invoiceLink: data.result });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return res.status(500).json({ error: err.message });
  }
}
