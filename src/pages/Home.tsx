import UserCard from "../components/UserCard";
import TelegramStarsCard from "../components/TelegramStarsCard";
import StarsBalance from "../components/StarsBalance";
import StarsActions from "../components/StarsActions";
import TransactionHistory from "../components/TransactionHistory";
import StarsStats from "../components/StarsStats";
import StarsOverview from "../components/StarsOverview";

import useTelegramUser from "../hooks/useTelegramUser";
import useTelegramStars from "../hooks/useTelegramStars";
import useTelegramTransactions from "../hooks/useTelegramTransactions";
import useStarsStats from "../hooks/useStarsStats";

export default function Home() {
  const user = useTelegramUser();

  const {
    stars,
    buyStars,
    spendStars,
  } = useTelegramStars();

  const {
    transactions,
    addTransaction,
  } = useTelegramTransactions();

  const {
    totalBought,
    totalSpent,
  } = useStarsStats(transactions);

  const handleBuy = () => {
    buyStars(10);
    addTransaction("buy", 10);
  };

  const handleSpend = () => {
    spendStars(10);
    addTransaction("spend", 10);
  };

  return (
    <div style={{ padding: "20px" }}>
      <UserCard user={user} />

      <TelegramStarsCard
        stars={stars}
        onBuy={handleBuy}
        onSpend={handleSpend}
      />

      <StarsBalance stars={stars} />

      <StarsActions
        onBuy={handleBuy}
        onSpend={handleSpend}
      />

      <StarsStats
        stars={stars}
        totalBought={totalBought}
        totalSpent={totalSpent}
      />

      <StarsOverview
        stars={stars}
        totalBought={totalBought}
        totalSpent={totalSpent}
      />

      <TransactionHistory
        transactions={transactions}
      />
    </div>
  );
}
