const request = require("supertest");
const app = require("../app"); 
const Task = require("../models/task");
const mongoose = require("mongoose");
const Reporting = require("../repository/report");

beforeEach(async () => {
  await Task.deleteMany();

  await Task.create([
    {
      description: "Task 1",
      completed: true,
      createdAt: new Date("2024-09-01"),
      updatedAt: new Date("2024-09-05"),
      dueDate: new Date("2024-09-05"),
      assignedMember: "Anna"
    },
    {
      description: "Task 2",
      completed: true,
      createdAt: new Date("2024-09-02"),
      updatedAt: new Date("2024-09-06"),
      dueDate: new Date("2024-09-06"),
      assignedMember: "Arman"
    },
    {
      description: "Task 3",
      completed: true,
      createdAt: new Date("2024-09-03"),
      updatedAt: new Date("2024-09-07"),
      dueDate: new Date("2024-09-07"),
      assignedMember: "Anna"
    },
    {
      description: "Task 4",
      completed: false, 
      createdAt: new Date("2024-09-04"),
      updatedAt: new Date("2024-09-08"),
      dueDate: new Date("2024-09-08"),
      assignedMember: "Tigran"
    }
  ]);
});

afterAll(async () => {

  await mongoose.connection.close();
});

describe("Reporting Routes", () => {

  test("should generate task completion report by time period", async () => {
    const startDate = "2024-09-01";
    const endDate = "2024-09-10";

    const response = await request(app)
      .get("/reports/completion-by-period")
      .query({ startDate, endDate })
      .expect(200);

    expect(response.body).toMatchObject({
      totalCompletedTasks: 3, 
      avgCompletionTimeInHours: expect.any(Number),
    });
  });

  test("should return error if startDate or endDate is missing", async () => {
    await request(app)
      .get("/reports/completion-by-period")
      .query({ startDate: "2024-09-01" }) // Missing endDate
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("startDate and endDate are required");
      });

    await request(app)
      .get("/reports/completion-by-period")
      .query({ endDate: "2024-09-10" }) // Missing startDate
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("startDate and endDate are required");
      });
  });

  test("should generate task completion report by team member", async () => {
    const response = await request(app)
      .get("/reports/completion-by-member")
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
        { assignedMember: "Anna", totalCompletedTasks: 2 },
        { assignedMember: "Arman", totalCompletedTasks: 1 }
      ])
    );
  });

  test("should handle server errors for task completion by period", async () => {
    jest.spyOn(Reporting, "taskCompletionByTimePeriod").mockRejectedValue(new Error("Server error"));

    const startDate = "2024-09-01";
    const endDate = "2024-09-10";

    const response = await request(app)
      .get("/reports/completion-by-period")
      .query({ startDate, endDate })
      .expect(500);

    expect(response.body.error).toContain("Error generating report by time period");
  });

  test("should handle server errors for task completion by team member", async () => {
    jest.spyOn(Reporting, "taskCompletionByTeamMember").mockRejectedValue(new Error("Server error"));

    const response = await request(app)
      .get("/reports/completion-by-member")
      .expect(500);

    expect(response.body.error).toContain("Error generating report by team member");
  });
});
