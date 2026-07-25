export type TelegramPayment = {
  id: string;
  amount: number;
  currency: "XTR";
  status: "pending" | "paid" | "failed";
};

export async function createTelegramPayment(
  amount: number
): Promise<TelegramPayment> {
  return {
    id: crypto.randomUUID(),
    amount,
    currency: "XTR",
    status: "pending",
  };
}

export async function confirmTelegramPayment(
  payment: TelegramPayment
): Promise<TelegramPayment> {
  return {
    ...payment,
    status: "paid",
  };
}
