const request = require('supertest');
const chai = require('chai');
const app = require('../app'); // No .js needed in CommonJS

const { expect } = chai;

const VALID_DATA = {
  firstname: 'Jay',
  lastname: 'Tiwari',
  email: `testuser_${Date.now()}@example.com`,
  password: 'Password123',
  confirmPassword: 'Password123'
};

const NAME_WITH_NUMBERS = {
  ...VALID_DATA,
  firstname: 'Jay123',
  lastname: 'Tiwari'
};

const INVALID_EMAIL = {
  ...VALID_DATA,
  email: 'invalid-email'
};

const SHORT_NAME = {
  ...VALID_DATA,
  firstname: 'J',
  lastname: 'T'
};

const WEAK_PASSWORD = {
  ...VALID_DATA,
  password: 'password',
  confirmPassword: 'password'
};

const PASSWORD_MISMATCH = {
  ...VALID_DATA,
  confirmPassword: 'different123'
};

const SHORT_PASSWORD = {
  ...VALID_DATA,
  password: 'ab1',
  confirmPassword: 'ab1'
};

describe('POST /api/register', () => {
  it('should register user with valid data', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(VALID_DATA);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.contain('User registered');
  });

  it('should fail if name contains numbers', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(NAME_WITH_NUMBERS);

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an('array');
    expect(res.body.errors.some(err => err.path === 'firstname')).to.be.true;
  });

  it('should fail if email format is invalid', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(INVALID_EMAIL);

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an('array');
    expect(res.body.errors.some(err => err.path === 'email')).to.be.true;
  });
});

describe('User Validation - Name Rules', () => {
  it('should fail when name is too short', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(SHORT_NAME);

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an('array');
    expect(res.body.errors.some(err => 
      err.path === 'firstname' || err.path === 'lastname'
    )).to.be.true;
  });
});

describe('User Validation - Password Rules', () => {
  it('should fail with invalid password (weak or short)', async () => {
    const weakRes = await request(app)
      .post('/api/register')
      .send(WEAK_PASSWORD);

    expect(weakRes.status).to.equal(400);
    expect(weakRes.body.errors).to.be.an('array');
    expect(weakRes.body.errors.some(err => err.path === 'password')).to.be.true;

    const shortRes = await request(app)
      .post('/api/register')
      .send(SHORT_PASSWORD);

    expect(shortRes.status).to.equal(400);
    expect(shortRes.body.errors).to.be.an('array');
    expect(shortRes.body.errors.some(err => err.path === 'password')).to.be.true;
  });

  it('should fail when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(PASSWORD_MISMATCH);

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an('array');
    expect(res.body.errors.some(err => err.path === 'confirmPassword')).to.be.true;
  });
});