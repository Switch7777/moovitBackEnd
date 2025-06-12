const request = require("supertest");
const app = require("../app");

describe("POST /api/auth/signup", () => {
  it("create a new User with email and mot de passe", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      email: "email@email.com",
      password: "Password06@",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("provToken");
  });
});
