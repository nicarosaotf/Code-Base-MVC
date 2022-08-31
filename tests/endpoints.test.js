require('dotenv').config();
const request = require('supertest');

const baseURL = `http://localhost:${process.env.PORT}`

describe("GET /users", () => {

  beforeAll(async() => {
    console.log("This executes before the test");
  });

  afterAll(async() => {
    console.log('This executes after the test');
  });

  it("should return 200", async () => {
    const response = await request(baseURL).get("/users");
    expect(response.statusCode).toBe(200);
  })

  it("should return a msg", async () => {
    const response = await request(baseURL).get("/users");
    expect(response.body.msg === "This is a returned message").toBe(true);
  });
});