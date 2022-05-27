const db = require("../data/dbConfig")
const Users = require("./users/users-model")
const server = require("./server")
const supertest = require("supertest")

test("sanity", () => {
  expect(true).toBe(true)
})

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest
})

beforeEach(async () => {
  await db("users").truncate()
  await db("users").insert([
    { username: "kim", password: "123" },
    { username: "test", password: "123" }
  ])
})

afterAll( async () => {
  await db.destroy()
})


describe("POST /register", () => {

  test("username and password are provided", async () => {
    let response = await supertest(server).get("/api/auth/register")
    .send({ password: "something" })
    expect(response.body).toBe("please provide a username and password")
  })

})