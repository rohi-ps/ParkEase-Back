const { expect } = require('chai');
const {
  calculateParkingCharges,
  generateInvoiceId
} = require('../src/utils/billingUtils');

describe('Billing Utils', () => {
  describe('calculateParkingCharges', () => {
    it('should calculate charges correctly for 2W vehicle within base hour', async () => {
      const result = await calculateParkingCharges(
        '2W',
        '2025-10-28T10:00:00Z',
        '2025-10-28T10:45:00Z'
      );
      expect(result).to.have.property('totalAmount').equal(30); // Base rate + (additionalHours * additionalHourRate)
    });

    it('should calculate charges correctly for 4W with additional hours', async () => {
      const result = await calculateParkingCharges(
        '4W',
        '2025-10-28T10:00:00Z',
        '2025-10-28T12:30:00Z'
      );
      // Base rate (60) + 2 additional hours (40 * 2) = 140
      expect(result).to.have.property('totalAmount').equal(140);
      expect(result.baseRate).to.equal(60);
      expect(result.additionalHourRate).to.equal(40);
      expect(result.duration).to.equal(3);
    });

    it('should throw error for invalid vehicle type', async () => {
      try {
        await calculateParkingCharges(
          '3W',
          '2025-10-28T10:00:00Z',
          '2025-10-28T11:00:00Z'
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Invalid vehicle type');
      }
    });
  });

  describe('generateInvoiceId', () => {
    it('should generate unique invoice IDs', () => {
      const id1 = generateInvoiceId();
      const id2 = generateInvoiceId();
      expect(id1).to.not.equal(id2);
    });


  });
});
