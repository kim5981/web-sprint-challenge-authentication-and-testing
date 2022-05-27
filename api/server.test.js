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


describe("POST /register", () => {

  test("check username and password upon registration", async () => {
    // send a GET request with an unhashed password or missing password
    let response = await supertest(server).post("/api/auth/register")
    .send({})
    expect(response.status).toBe(400)
    expect(response.body).toBe("please provide a username and password")
  })

  test("cannot register with an existing username")
})