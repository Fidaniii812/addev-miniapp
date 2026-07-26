import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getTelegramWebApp } from "../lib/telegram";

export type TelegramUser = {
  id: number;
  username?: string;
  first_name: string;
};

export default function useTelegramUser() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const tg = getTelegramWebApp();

    if (!tg?.initDataUnsafe?.user) return;

    const telegramUser = tg.initDataUnsafe.user;

    setUser(telegramUser);

    saveUser(telegramUser);
  }, []);

  async function saveUser(telegramUser: TelegramUser) {
    const { error } = await supabase
      .from("users")
      .upsert({
        telegram_id: telegramUser.id,
        username: telegramUser.username ?? "",
        first_name: telegramUser.first_name,
      });

    if (error) {
      console.log(error);
    }
  }

  return user;
}
