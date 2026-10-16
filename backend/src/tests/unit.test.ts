import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateCrowdSimulation } from "../services/crowd.js";

describe("Crowd Simulation Service", () => {
  test("returns valid level and percent within bounds (8% to 96%)", () => {
    const morning = new Date("2026-10-16T07:30:00Z");
    const result = calculateCrowdSimulation("taj-mahal", morning);

    assert.ok(result.percent >= 8 && result.percent <= 96, `Percent out of bounds: ${result.percent}`);
    assert.ok(["LOW", "MEDIUM", "HIGH"].includes(result.level), `Invalid level: ${result.level}`);
  });

  test("peak afternoon hours produce higher crowd than early morning", () => {
    const earlyMorning = new Date(2026, 9, 16, 6, 0, 0); // 6 AM
    const afternoon = new Date(2026, 9, 16, 13, 0, 0);    // 1 PM

    const early = calculateCrowdSimulation("taj-mahal", earlyMorning);
    const peak = calculateCrowdSimulation("taj-mahal", afternoon);

    assert.ok(peak.percent >= early.percent, `Peak afternoon (${peak.percent}%) should be >= early morning (${early.percent}%)`);
  });

  test("classifies correctly by threshold (LOW < 40, MEDIUM 40-74, HIGH >= 75)", () => {
    const lowCheck = calculateCrowdSimulation("ajanta-caves", new Date("2026-10-16T05:00:00Z"));
    if (lowCheck.percent < 40) {
      assert.equal(lowCheck.level, "LOW");
    } else if (lowCheck.percent < 75) {
      assert.equal(lowCheck.level, "MEDIUM");
    } else {
      assert.equal(lowCheck.level, "HIGH");
    }
  });
});
