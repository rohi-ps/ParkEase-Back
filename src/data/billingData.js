// Sample invoice data
const invoices = [
  {
    invoiceId: "INV001",
    userId: "USR001",
    parkingSpotId: "PS001",
    vehicleType: "4W",
    checkInTime: "2025-10-15T10:00:00Z",
    checkOutTime: "2025-10-15T12:00:00Z",
    amount: 100,
    paymentMethod: "credit_card",
    status: "paid",
    timestamp: "2025-10-15T12:01:00Z"
  },
  {
    invoiceId: "INV002",
    userId: "USR002",
    parkingSpotId: "PS002",
    vehicleType: "2W",
    checkInTime: "2025-10-15T09:00:00Z",
    checkOutTime: "2025-10-15T11:30:00Z",
    amount: 75,
    paymentMethod: "upi",
    status: "pending",
    timestamp: "2025-10-15T11:31:00Z"
  }
];

// Rate card for different vehicle types (per hour)
const rateCard = {
  "4W": {
    baseRate: 60,    // Base rate for four-wheelers (first hour)
    additionalHourRate: 40  // Rate for each additional hour
  },
  "2W": {
    baseRate: 30,    // Base rate for two-wheelers (first hour)
    additionalHourRate: 20  // Rate for each additional hour
  }
};

// Available payment methods
const paymentMethods = [
  "credit_card",
  "debit_card",
  "upi",
  "net_banking",
  "wallet"
];

module.exports = {
  invoices,
  rateCard,
  paymentMethods
};
