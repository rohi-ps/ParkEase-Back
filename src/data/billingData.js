// Sample invoice data
const invoices = [
  {
    invoiceId: "INV001",
    userId: "USR001",
    parkingSpotId: "PS001",
    vehicleType: "car",
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
    vehicleType: "bike",
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
  car: {
    baseRate: 50,
    additionalHourRate: 30
  },
  bike: {
    baseRate: 30,
    additionalHourRate: 20
  },
  truck: {
    baseRate: 80,
    additionalHourRate: 50
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
