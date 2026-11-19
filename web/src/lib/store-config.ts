export const storeConfig = {
  // Turn this on only after a bank payment gateway has been connected
  cardPaymentsEnabled: false,

  // The business's own receiving account, shown to customers who pay by transfer
  bank: {
    bankName: "Bank name here",
    accountName: "Business account name here",
    accountNumber: "Account number here",
  },
};
