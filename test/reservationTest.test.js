const { expect } = require('chai');
const request = require('supertest');
const app = require('../app'); 

describe('Reservation API Integration', () => {
  const validReservation = {
    slotID: 'A1',
    VehicleType: '4W',
    vehicleNumber: 'TN01AB5678',
    EntryDate: '2025-10-28',
    EntryTime: '09:00',
    ExitDate: '2025-10-28',
    ExitTime: '10:00'
  };

  it('should create a reservation', async () => {
    const res = await request(app)
      .post('/api/v1/reservations/create')
      .send(validReservation);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Slot created successfully');
  });

  it('should fail to create reservation with invalid vehicle number', async () => {
    const invalidData = { ...validReservation, vehicleNumber: 'TN01A5678' };
    const res = await request(app)
      .post('/api/v1/reservations/create')
      .send(invalidData);
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('Invalid vehicle number format. Use TN01AB5678');
  });

  it('should update an existing reservation', async () => {
    const updatedData = { ...validReservation, ExitTime: '11:00' };
    const res = await request(app)
      .put('/api/v1/reservations/update')
      .send(updatedData);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Slot updated successfully');
  });

  it('should return 404 when updating non-existent slot', async () => {
    const nonExistent = { ...validReservation, slotID: 'ZZ99' };
    const res = await request(app)
      .put('/api/v1/reservations/update')
      .send(nonExistent);
    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal('Slot not found');
  });

  it('should get all reservations', async () => {
    const res = await request(app).get('/api/v1/reservations/getall');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('should delete a reservation', async () => {
    const res = await request(app).delete('/api/v1/reservations/delete/A1');
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Slot deleted successfully');
  });

  it('should return 404 when deleting non-existent slot', async () => {
    const res = await request(app).delete('/api/v1/reservations/delete/ZZ99');
    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal('Slot not found');
  });
});
