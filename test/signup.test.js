const request = require('supertest');
const app = require('../app'); 

describe('POST /api/auth/signup', () => {
  it('return stautus code 400 if one field is missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'incomplet@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toMatch(/manquants/i);
  });

  it('return code 422 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'notanemail', password: '123456' });

    expect(res.statusCode).toBe(422);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toMatch(/email valide/i);
  });

  it('return 409 if email already exists', async () => {
    await request(app).post('/api/auth/signup').send({
      email: 'duplicate@test.com',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/signup').send({
      email: 'duplicate@test.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toMatch(/existant/i);
  });

  it('should create a user and return a provToken', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'newuser@test.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body).toHaveProperty('provToken');
  });
});