const request = require("supertest");
const app = require("../app");
const User = require("../models/users");
const bcrypt = require("bcrypt");
// TEST pour savoir le signup est OK
describe("POST /api/auth/signin", () => {
  it("should return 200 and token if user is onboarded", async () => {
    const hashedPassword = bcrypt.hashSync("Test1234", 10);

    const newUser = new User({
      email: "user1@test.com",
      password: hashedPassword,
      provToken: "",
      token: "test",
    });
    newUser.save();

    const res = await request(app).post("/api/auth/signin").send({
      email: "user1@test.com",
      password: "Test1234",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body).toHaveProperty("token");
  });

  it("should return 202 and provToken if user did not onboarded ", async () => {
    const newUser = new User({
      email: "user2@test.com",
      password: bcrypt.hashSync("123456", 10),
      provToken: "test",
      token: "",
    });
    newUser.save();

    const res = await request(app).post("/api/auth/signin").send({
      email: "user2@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(202);
    expect(res.body.result).toBe(true);
    expect(res.body).toHaveProperty("provToken");
  });

  it("return 401 if password incorrect", async () => {
    const newUser = new User({
      email: "user3@test.com",
      password: bcrypt.hashSync("correct123", 10),
      provToken: "",
      token: "validToken",
    });
    await newUser.save();

    const res = await request(app).post("/api/auth/signin").send({
      email: "user3@test.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toMatch(/erroné/i);
  });

  it("should return 404 if user does not exist", async () => {
    const res = await request(app).post("/api/auth/signin").send({
      email: "inexistant@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toMatch(/inexistant/i);
  });
});
