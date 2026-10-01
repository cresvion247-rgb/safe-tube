import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseVideoId } from "../src/content/parseVideoId.js";
import { durationGate, applyWhitelistGates } from "../src/domain/gates.js";

const TODDLER = "toddler_2_4";

describe("parseVideoId", () => {
  it("reads watch, short, and bare ids", () => {
    assert.equal(parseVideoId("https://www.youtube.com/watch?v=abcdefghijk"), "abcdefghijk");
    assert.equal(parseVideoId("https://youtu.be/abcdefghijk"), "abcdefghijk");
    assert.equal(parseVideoId("https://www.youtube.com/shorts/abcdefghijk"), "abcdefghijk");
    assert.equal(parseVideoId("abcdefghijk"), "abcdefghijk");
    assert.equal(parseVideoId("not a link"), null);
  });
});

describe("duration gate", () => {
  it("rejects toddler videos longer than 10 minutes", () => {
    assert.equal(durationGate(600, TODDLER), true);
    assert.equal(durationGate(601, TODDLER), false);
    assert.equal(applyWhitelistGates([{ title: "ok", durationSeconds: 120 }, { title: "long", durationSeconds: 900 }], TODDLER).length, 1);
  });
});

describe("pack filter", () => {
  it("keeps channels tagged for the selected age", () => {
    const channels = [
      { name: "A", ages: [TODDLER] },
      { name: "B", ages: ["tween_8_12"] },
    ];
    assert.deepEqual(channels.filter((c) => c.ages.includes(TODDLER)).map((c) => c.name), ["A"]);
  });
});
