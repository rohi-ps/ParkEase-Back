// const { expect } = require('chai');
// const {
//   calculateParkingDuration,
//   calculateParkingCharges,
//   generateInvoiceId
// } = require('../src/utils/billingUtils');

// describe('Billing Utils', () => {
//   describe('calculateParkingDuration', () => {
//     it('should calculate duration correctly for same day parking', () => {
//       const checkIn = '2025-10-28T10:00:00Z';
//       const checkOut = '2025-10-28T12:00:00Z';
//       const duration = calculateParkingDuration(checkIn, checkOut);
//       expect(duration).to.equal(2);
//     });

//     it('should round up partial hours', () => {
//       const checkIn = '2025-10-28T10:00:00Z';
//       const checkOut = '2025-10-28T11:30:00Z';
//       const duration = calculateParkingDuration(checkIn, checkOut);
//       expect(duration).to.equal(2); // Should round up 1.5 hours to 2
//     });

//     it('should calculate duration across midnight', () => {
//       const checkIn = '2025-10-28T23:00:00Z';
//       const checkOut = '2025-10-29T01:00:00Z';
//       const duration = calculateParkingDuration(checkIn, checkOut);
//       expect(duration).to.equal(2);
//     });
//   });

//   describe('calculateParkingCharges', () => {
//     it('should calculate charges correctly for 2W vehicle within base hour', async () => {
//       const result = await calculateParkingCharges(
//         '2W',
//         '2025-10-28T10:00:00Z',
//         '2025-10-28T10:45:00Z'
//       );
//       expect(result).to.have.property('totalAmount').equal(30); // Base rate for 2W
//     });

//     it('should calculate charges correctly for 4W with additional hours', async () => {
//       const result = await calculateParkingCharges(
//         '4W',
//         '2025-10-28T10:00:00Z',
//         '2025-10-28T12:30:00Z'
//       );
//       // Base rate (60) + 2 additional hours (40 * 2) = 140
//       expect(result).to.have.property('totalAmount').equal(140);
//     });

//     it('should throw error for invalid vehicle type', async () => {
//       try {
//         await calculateParkingCharges(
//           '3W',
//           '2025-10-28T10:00:00Z',
//           '2025-10-28T11:00:00Z'
//         );
//         expect.fail('Should have thrown an error');
//       } catch (error) {
//         expect(error.message).to.equal('Invalid vehicle type');
//       }
//     });
//   });

//   describe('generateInvoiceId', () => {
//     it('should generate unique invoice IDs', () => {
//       const id1 = generateInvoiceId();
//       const id2 = generateInvoiceId();
//       expect(id1).to.not.equal(id2);
//     });


//   });
// });
