const request = require('supertest');
const chai = require('chai');
const app = require('../app'); // No .js needed in CommonJS
const { expect } = chai;

const VALID_DATA = {
  firstName: 'Durga',
  lastName: 'Prasad',
  email: `some@gmail.com`,
  password: 'Password@123',
  confirmPassword: 'Password@123',
  phone: '9876509876'
};

const NAME_WITH_NUMBERS = {
  ...VALID_DATA,
  firstName: 'Sai143',
  lastName: 'Prasad143'
};

const INVALID_EMAIL = {
  ...VALID_DATA,
  email: 'durgaPrasad.com'
};
const PASSWORD_MISMATCH = {
  ...VALID_DATA,
  confirmPassword: 'different123'
};
const BAD_PHONE = {
  ...VALID_DATA,
  phone: '1234'
};
const NON_EXISTENT_USER = {
  email: 'nouser@gmail.com',
  password: 'Password123'
};
describe('POST/api/register', () => {
  it('should fail if required fields are missing', async () => {
  const res = await request(app)
    .post('/api/register')
    .send({ email: '', password: '' });

  expect(res.status).to.equal(400);
  expect(res.body.errors).to.be.an('array');
});
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
    expect(res.body.errors.some(err => err.path === 'firstName' || err.path === 'lastName' )).to.be.true;
  });
    it('should fail if phone number is invalid', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(BAD_PHONE);
      expect(res.status).to.equal(400);
      expect(res.body.errors).to.be.an('array');
      expect(res.body.errors.some(err => err.path === 'phone')).to.be.true;
  });
});

describe('Password Rules', () => {
  it('should fail with invalid password', async () => {
    const weakPassword = await request(app)
      .post('/api/register')
      .send({ PASSWORD_MISMATCH});

    expect(weakPassword.status).to.equal(400);
    expect(weakPassword.body.errors).to.be.an('array');
    expect(weakPassword.body.errors.some(err => err.path === 'password')).to.be.true;
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


  it('should fail if email format is invalid', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(INVALID_EMAIL);

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an('array');
    expect(res.body.errors.some(err => err.path === 'email')).to.be.true;
  });
  describe('POST /api/login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app)  
      .post('/api/login')
      .send({ email: VALID_DATA.email, password: VALID_DATA.password });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
  })
 it('should fail login with incorrect password', async () => {
  const res = await request(app)
    .post('/api/login')
    .send({ email: VALID_DATA.email, password: 'WrongPassword123' });

  expect(res.status).to.equal(401);
  expect(res.body).to.have.property('message');
  expect(res.body.message).to.equal('Wrong Password');
});

it('should fail login for non-existent user', async () => {
  const res = await request(app)
    .post('/api/login')
    .send(NON_EXISTENT_USER);

  expect(res.status).to.equal(404);
  expect(res.body).to.have.property('message');
  expect(res.body.message).to.equal('User not found');
});

}) 
