const db = require("../data/dbConfig")

const server = require("./server")
const supertest = require("supertest")
 
test("sanity", () => {
  expect(true).toBe(true)
})
 
beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
 
beforeEach(async () => {
  await db("users").truncate()
  await db("users").insert([
    { username: "kim", password: "123" },
    { username: "test", password: "123" }
  ])
})
 
afterAll(async () => {
  await db.destroy()
})
 
 
const users = async () => {
  await db("users")
}
 
describe("POST /api/auth/register", () => {
 
  test("check username and password upon registration", async () => {
    let response = await supertest(server).post("/api/auth/register")
    .send({})
    expect(response.status).toBe(400)
    expect(response.body).toBe("username and password required")
    //confirm user was not created
    users()
    expect(users).toHaveLength(0)
  })
 
  test("if username is taken, returns 'username taken'", async () => {
    await supertest(server).post("/api/auth/register")
    .send({ username: "foo", password: "123" })
    
    let response = await supertest(server).post("/api/auth/register")
    .send({ username: "foo", password: "123" })
    expect(response.body).toBe("username taken")
    users()
    expect(users).toHaveLength(0)
  })
 
  test("responds with 201 upon successful registration", async () => {
    let response = await supertest(server).post("/api/auth/register").send({ username: "foo", password: "123" })
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("username", "foo")
  })
})
 
describe("POST /api/auth/login", () => {
  test("checks username and password are provided in login", async () => {
    let response = await supertest(server).post("/api/auth/login").send({})
    expect(response.status).toBe(400)
  })
 
  test("checks missing username or password when logging in", async () => {
    let response = await supertest(server).post("/api/auth/login").send({ username: "foo" })
    expect(response.body).toBe("username and password required")
    response = await supertest(server).post("/api/auth/login").send({ password: "123" })
    expect(response.body).toBe("username and password required")
  })
 
  test("logging in with non-existent username returns 'invalid credentials'", async () => {
    let response = await supertest(server).post("/api/auth/login").send({ username: "null", password: "123" })
    expect(response.body).toBe("invalid credentials")
  })
 
  test("logging in with incorrect password returns 'invalid credentials'", async () => {
    await supertest(server).post("/api/auth/register").send({ username: "null", password: "123" })
    let response = await supertest(server).post("/api/auth/login").send({ username: "null", password: "password" })
    expect(response.body).toBe("invalid credentials")
  })
 
  test("responds with message and token on successful login", async () => {
    // register
    let response = await supertest(server).post("/api/auth/register")
    .send({ username: "foo", password: "123" })
    //login
    response = await supertest(server).post("/api/auth/login")
    .send({ username: "foo", password: "123" })
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token")
    expect(response.body).toHaveProperty("message", 'welcome, foo')
  })
 
 
})
 
describe("GET /api/jokes", () => {
 
  test("rejects request with message if no valid token", async () => {
    const response = await supertest(server).post("/api/jokes").set("Authorization", "none")
    expect(response.body.message).toBe("token invalid")
  })
 
  test("returns array of jokes upon valid token", async () => {
    //register
    await supertest(server).post("/api/auth/register").send({ username: "foo", password: "123" })
    //login
    let res = await supertest(server).post("/api/auth/login").send({ username: "foo", password: "123" })
    let jokes = supertest(server).get("/api/jokes").set("Authorization", res.body)
    expect(jokes.body).toBeInstanceOf(Array)
    expect(jokes.body).toHaveLength(3)
    expect(jokes.status).toBe(200)
  })
})

