import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import app from "../app.js";

let server: Server;
let baseUrl: string;

describe("Backend API Integration Tests", () => {
  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test("GET /api/health returns healthy", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "healthy");
  });

  test("GET /api/stats returns site and verified guide counts", async () => {
    const res = await fetch(`${baseUrl}/api/stats`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.siteCount >= 15, "Expected at least 15 sites");
    assert.ok(body.data.verifiedGuideCount >= 12, "Expected at least 12 verified guides");
  });

  test("GET /api/sites returns all heritage sites with crowd info", async () => {
    const res = await fetch(`${baseUrl}/api/sites`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 15);
    const first = body.data[0];
    assert.ok(first.name);
    assert.ok(first.crowd);
    assert.ok(["LOW", "MEDIUM", "HIGH"].includes(first.crowd.level));
  });

  test("GET /api/sites/map returns lightweight map pins", async () => {
    const res = await fetch(`${baseUrl}/api/sites/map`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 15);
    assert.ok(typeof body.data[0].lat === "number");
    assert.ok(typeof body.data[0].lng === "number");
  });

  test("GET /api/sites/:slug returns multilingual content and details", async () => {
    const res = await fetch(`${baseUrl}/api/sites/taj-mahal?locale=hi`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.slug, "taj-mahal");
    assert.ok(body.data.content);
    assert.equal(body.data.content.locale, "hi");
  });

  test("GET /api/sites/:slug/alternatives returns ranked alternatives", async () => {
    const res = await fetch(`${baseUrl}/api/sites/taj-mahal/alternatives`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.target);
    assert.ok(Array.isArray(body.data.alternatives));
    assert.ok(body.data.alternatives.length > 0);
  });

  test("GET /api/guides/verify validates verified vs unverified vs not_found", async () => {
    // 1. Exact verified
    const res1 = await fetch(`${baseUrl}/api/guides/verify?q=ASI-RAJ-001`);
    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.data.status, "verified");

    // 2. Unverified
    const res2 = await fetch(`${baseUrl}/api/guides/verify?q=UNLIC-RAV-011`);
    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.equal(body2.data.status, "unverified");

    // 3. Not found
    const res3 = await fetch(`${baseUrl}/api/guides/verify?q=NON-EXISTENT-GUIDE-999`);
    assert.equal(res3.status, 200);
    const body3 = await res3.json();
    assert.equal(body3.data.status, "not_found");
  });

  test("POST /api/auth/login and /api/auth/me workflow", async () => {
    // Login with demo user
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "demo@heritage-india.com",
        password: "Demo@1234",
      }),
    });
    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.ok(loginBody.data.token);
    const token = loginBody.data.token;

    // Call /api/auth/me with Bearer token
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meRes.status, 200);
    const meBody = await meRes.json();
    assert.equal(meBody.data.user.email, "demo@heritage-india.com");
  });

  test("GET /api/pricing calculates itemized taxes and breakdown", async () => {
    const sitesRes = await fetch(`${baseUrl}/api/sites`);
    const sitesData = await sitesRes.json();
    const siteId = sitesData.data[0].id;

    const res = await fetch(`${baseUrl}/api/pricing?siteId=${siteId}&partySize=2`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.totalINR > 0);
    assert.ok(Array.isArray(body.data.lineItems));
    assert.ok(body.data.lineItems.length >= 3);
  });
});
