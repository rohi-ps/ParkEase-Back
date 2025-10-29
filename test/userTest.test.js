const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app'); // Adjust path to your Express app

const usersFile = path.join(__dirname, '../data/users.json');

describe('Auth API Tests', () => {
  const testUser = {
    email: 'testuser@example.com',
    firstname: 'Test',
    lastname: 'User',
    password: 'TestPass123',
    confirmPassword: 'TestPass123'
  };

  before(() => {
    // Clean up test user if it exists
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const filtered = users.filter(u => u.email !== testUser.email);
      fs.writeFileSync(usersFile, JSON.stringify(filtered, null, 2));
    }
  });

  describe('POST /api/registration', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/registration')
        .send(testUser);

      expect(res.status).to.equal(201);
      expect(res.body.message).to.include('User registered');
    });

    it('should not register an existing user', async () => {
      const res = await request(app)
        .post('/api/registration')
        .send(testUser);

      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal('User already exists');
    });
  });

  describe('POST /api/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: testUser.email, password: 'WrongPass' });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Invalid credentials');
    });
  });

  describe('POST /api/logout', () => {
    let token;

    before(async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: testUser.email, password: testUser.password });
      token = res.body.token;
    });

    it('should logout and blacklist the token', async () => {
      const res = await request(app)
        .post('/api/logout')
        .set('Authorization', token);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Logout successful');
    });
  });
});
