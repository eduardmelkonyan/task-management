const request = require("supertest");
const app = require("../app"); 
const Task = require("../models/task");
const mongoose = require("mongoose");

beforeEach(async () => {
  await Task.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Task API", () => {
  test("should create a new task", async () => {
    const taskData = {
      description: "Test task",
      dueDate: "2024-09-29",
      assignedMember: "John Doe"
    };

    const response = await request(app)
      .post("/tasks")
      .send(taskData)
      .expect(201);

    expect(response.body).toMatchObject({
      description: taskData.description,
      dueDate: expect.any(String),
      completed: false,
      assignedMember: taskData.assignedMember
    });

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
  });

  test("should get all tasks", async () => {
    await new Task({ description: "Task 1", dueDate: "2024-09-29", assignedMember: "Anna", completed: true }).save();
    await new Task({ description: "Task 2", dueDate: "2024-09-30", assignedMember: "Arman" }).save();

    const response = await request(app)
      .get("/tasks")
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(response.body[0].description).toBe("Task 1");
    expect(response.body[1].description).toBe("Task 2");
  });

  test("should get task by ID", async () => {
    const task = await new Task({ description: "Task by ID", dueDate: "2024-09-29", assignedMember: "John Johnson" }).save();

    const response = await request(app)
      .get(`/tasks/${task._id}`)
      .expect(200);

    expect(response.body.description).toBe("Task by ID");
  });

  test("should return 404 if task not found by ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app)
      .get(`/tasks/${fakeId}`)
      .expect(404);
  });

  test("should mark a task as completed", async () => {
    const task = await new Task({
      description: "Mark this as completed",
      dueDate: "2024-09-29",
      assignedMember: "John Doe",
      completed: false
    }).save();

    const response = await request(app)
      .patch(`/tasks/${task._id}`)
      .expect(200);

    expect(response.body.completed).toBe(true);

    const updatedTask = await Task.findById(task._id);
    expect(updatedTask.completed).toBe(true);
  });

  test("should return 404 when trying to update a non-existing task", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    await request(app)
      .patch(`/tasks/${fakeId}`)
      .expect(404);
  });
});
