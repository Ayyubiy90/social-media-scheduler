const request = require("supertest");
const express = require("express");
const admin = require("firebase-admin");
const postRoutes = require("../postRoutes.cjs");

const app = express();
app.use(express.json());
app.use(postRoutes);

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(() => ({})),
        get: jest.fn(() => ({
          exists: true,
          data: jest.fn(() => ({ notificationSettings: { email: true } })), // Default settings for the test user
        })),
        update: jest.fn(() => ({})),
        delete: jest.fn(() => ({})),
      })),
    })),
  })),
}));

describe("Notification Routes", () => {
  beforeAll(async () => {
    jest.setTimeout(20000); // Increase timeout to 20 seconds
    // Setup Firestore mock for test user
    admin.firestore().collection("users").doc("testUser").set({
      notificationSettings: { email: true } // Default settings for the test user
    });
  });

it("should create notification settings", async () => {
  jest.setTimeout(10000); // Increase timeout to 10 seconds
    const response = await request(app)
      .post("/notifications/settings")
      .set("Authorization", "Bearer testToken") // Ensure Authorization header is set
      .send({ userId: "testUser", preferences: { email: true } });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Notification settings created successfully.");
  });

it("should retrieve notification settings", async () => {
  jest.setTimeout(10000); // Increase timeout to 10 seconds
    const response = await request(app)
      .get("/notifications/settings")
      .set("Authorization", "Bearer testToken"); // Ensure Authorization header is set
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ email: true });
  });

it("should update notification settings", async () => {
  jest.setTimeout(10000); // Increase timeout to 10 seconds
    const response = await request(app)
      .put("/notifications/settings")
      .set("Authorization", "Bearer testToken") // Ensure Authorization header is set
      .send({ preferences: { email: false } });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Notification settings updated successfully.");
  });

it("should delete notification settings", async () => {
  jest.setTimeout(10000); // Increase timeout to 10 seconds
    const response = await request(app)
      .delete("/notifications/settings")
      .set("Authorization", "Bearer testToken"); // Ensure Authorization header is set
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Notification settings deleted successfully.");
  });
});
