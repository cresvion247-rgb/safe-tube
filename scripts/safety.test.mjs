import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeQuery, safeVideoId, plainText } from "../src/domain/safety.js";

describe("safety", () => {
  it("rejects scripts and weapon queries", () => {
    assert.equal(safeVideoId("abcdefghijk"), "abcdefghijk");
    assert.equal(safeVideoId("<script>"), null);
    assert.equal(safeQuery("javascript:alert(1)"), null);
    assert.equal(safeQuery("knife defense"), null);
    assert.equal(plainText("<b>Hello</b>"), "Hello");
  });
});
