const db = require("../data/dbConfig")
const Users = require("./users/users-model")
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


describe("POST /api/auth/register", () => {

  test("check username and password upon registration", async () => {
    let response = await supertest(server).post("/api/auth/register")
    .send({})
    expect(response.status).toBe(400)
    expect(response.body).toBe("please provide a username and password")
  })

  test("cannot register with an existing username", async () => {
    let response = await supertest(server).post("/api/auth/register")
    .send({ username: "foo", password: "123" })
    expect(response).toBeDefined()
    response = await supertest(server).post("/api/auth/register")
    .send({ username: "foo", password: "123" })
    expect(response.status).toBe(400)
    expect(response.body).toBe("username taken")
  })

  test("user info returned upon successful registration", async () => {
    let response = await supertest(server).post("/api/auth/register")
    .send({ username: "foo", password: "123" })
    expect(response).toBeDefined()
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("username", "foo")
  })
})

describe("POST /api/auth/login", () => {
  test("checks username and password are provided in login", async () => {
    let response
    response = await supertest(server).post("/api/auth/login")
    .send({})
    expect(response.status).toBe(400)
  })

  test("checks missing username or password from request body", async () => {
    let response = await supertest(server).post("/api/auth/login")
    .send({ username: "foo" })
    expect(response.body).toBe("username and password required")
    response = await supertest(server).post("/api/auth/login")
    .send({ password: "123" })
    expect(response.body).toBe("username and password required")
  })

  test("checks nonexistent username or invalid password", async () => {
    let response = await supertest(server).post("/api/auth/login")
    .send({ username: "null", password: "123" })
    let user = await Users.getByUsername({ username: "null"})
    expect(user).not.toBeDefined()
    expect(response.body).toBe("invalid credentials")
  })

  test("responds with message and token on successful login", async () => {
    // register
    let response = await supertest(server).post("/api/auth/register")
    .send({ username: "foo", password: "123" })
    //login
    response = await supertest(server).post("/api/auth/login")
    .send({ username: "foo", password: "123" })
    expect(response).toBe(200)
    expect(response.body).toHaveProperty("token")
    expect(response.body).toHaveProperty("message", 'welcome, foo')
  })

  
})