import TelegramStarsCard from "../components/TelegramStarsCard";
import StarsBalance from "../components/StarsBalance";
import TransactionHistory from "../components/TransactionHistory";

import useTelegramStars from "../hooks/useTelegramStars";
import useTelegramTransactions from "../hooks/useTelegramTransactions";

export default function WalletPage() {
  const { stars } = useTelegramStars();
  const { transactions } = useTelegramTransactions();

  return (
    <div style={{ padding: "20px" }}>
      <h1>💼 Wallet</h1>

      <TelegramStarsCard stars={stars} />

      <StarsBalance stars={stars} />

      <TransactionHistory
        transactions={transactions}
      />
    </div>
  );
}
