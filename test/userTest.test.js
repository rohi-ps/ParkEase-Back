const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

const usersFile = path.join(__dirname, '../data/users.json');
const blacklistFile = path.join(__dirname, '../data/blacklist.json');

const VALID_USER = {
  username: 'testUser',
  email: 'testUser@example.com',
  password: 'StrongPass1',
  confirmPassword: 'StrongPass1'
};

const DUPLICATE_USER = { ...VALID_USER };

const INVALID_USERNAME = {
  ...VALID_USER,
  username: 'ad'
};

const BLOCKED_USERNAME = {
  ...VALID_USER,
  username: 'admin'
};

const INVALID_EMAIL = {
  ...VALID_USER,
  email: 'invalid-email'
};

const WEAK_PASSWORD = {
  ...VALID_USER,
  password: 'weak',
  confirmPassword: 'weak'
};

const MISMATCHED_PASSWORD = {
  ...VALID_USER,
  confirmPassword: 'WrongPass1'
};

describe('Auth API Tests', () => {
  let token;

  before(() => {

    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      const filtered = users.filter(u => u.email !== VALID_USER.email);
      fs.writeFileSync(usersFile, JSON.stringify(filtered, null, 2));
    }
    if (fs.existsSync(blacklistFile)) {
      fs.writeFileSync(blacklistFile, JSON.stringify([], null, 2));
    }
  });

  describe('POST /register', () => {
    it('should register a valid user', async () => {
      const res = await request(app).post('/register').send(VALID_USER);
      expect(res.status).to.equal(201);
      expect(res.body.message).to.include('User registered');
    });

    it('should reject duplicate registration', async () => {
      const res = await request(app).post('/register').send(DUPLICATE_USER);
      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal('User already exists');
    });

    it('should reject short username', async () => {
      const res = await request(app).post('/register').send(INVALID_USERNAME);
      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.equal('Username must be at least 3 characters');
    });

    it('should reject blocked username "admin"', async () => {
      const res = await request(app).post('/register').send(BLOCKED_USERNAME);
      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.equal('Username "admin" is not allowed');
    });

    it('should reject invalid email format', async () => {
      const res = await request(app).post('/register').send(INVALID_EMAIL);
      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.equal('Invalid email format');
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/register').send(WEAK_PASSWORD);
      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.include('Password must be at least 8 characters');
    });

    it('should reject mismatched passwords', async () => {
      const res = await request(app).post('/register').send(MISMATCHED_PASSWORD);
      expect(res.status).to.equal(400);
      expect(res.body.errors[0].msg).to.equal('Passwords do not match');
    });
  });

  describe('POST /api/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: VALID_USER.email, password: VALID_USER.password });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      token = res.body.token;
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: VALID_USER.email, password: 'WrongPass' });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Invalid credentials');
    });
  });

  describe('POST /api/logout', () => {
    it('should logout and blacklist the token', async () => {
      const res = await request(app)
        .post('/api/logout')
        .set('Authorization', token);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Logout successful');
    });

    it('should reject logout without token', async () => {
      const res = await request(app)
        .post('/api/logout');

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Token required');
    });
  });
});
