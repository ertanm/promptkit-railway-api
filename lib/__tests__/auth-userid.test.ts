import { describe, expect, it } from "vitest"
import { getUserIdFromToken } from "../auth"

function encodeSegment(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url")
}

function makeJwt(payload: { userId: string; exp?: number }): string {
  const header = encodeSegment({ alg: "HS256", typ: "JWT" })
  const body = encodeSegment({ ...payload, exp: payload.exp ?? 9_999_999_999 })
  return `${header}.${body}.signature`
}

describe("getUserIdFromToken", () => {
  it("returns userId from JWT payload (matches server signToken shape)", () => {
    expect(getUserIdFromToken(makeJwt({ userId: "clu_01hqabcd" }))).toBe("clu_01hqabcd")
  })

  it("returns null when userId missing or not a string", () => {
    const header = encodeSegment({ alg: "HS256", typ: "JWT" })
    const body = encodeSegment({ exp: 9_999_999_999 })
    expect(getUserIdFromToken(`${header}.${body}.x`)).toBeNull()
  })

  it("returns null for malformed input", () => {
    expect(getUserIdFromToken("")).toBeNull()
    expect(getUserIdFromToken("nope")).toBeNull()
  })
})
