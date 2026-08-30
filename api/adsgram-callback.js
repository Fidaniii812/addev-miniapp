import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userid, user_id, reward } = req.method === 'GET' ? req.query : req.body;
    const userId = userid || user_id;
    const rewardAmount = Number(reward) || 10;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const newBalance = (userData?.balance || 0) + rewardAmount;

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({ success: true, newBalance });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
