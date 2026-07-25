import UserCard from "../components/UserCard";
import TelegramStarsCard from "../components/TelegramStarsCard";

import useTelegramUser from "../hooks/useTelegramUser";
import useTelegramStars from "../hooks/useTelegramStars";

export default function Home() {
  const user = useTelegramUser();

  const {
    stars,
    buyStars,
    spendStars,
  } = useTelegramStars();

  return (
    <div style={{ padding: "20px" }}>
      <UserCard user={user} />

      <TelegramStarsCard
        stars={stars}
        onBuy={() => buyStars(10)}
        onSpend={() => spendStars(10)}
      />
    </div>
  );
}
