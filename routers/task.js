const express = require("express");
const Task = require("../models/task");
const router = new express.Router();

router.post("/tasks", async (req, res) => {
    const task = new Task(req.body)
    try {
      await task.save();
      res.status(201).send(task);
    } catch (e) {
      res.status(400).send(e);
    }
  });

  router.patch("/tasks/:id", async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
  
      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }
      task.completed = true;
  
      await task.save();
      res.send(task);
    } catch (e) {
      res.status(400).send(e);
    }
  });

  router.get("/tasks", async (req, res) => {
    try {
      const tasks = await Task.find({});
      res.send(tasks);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  router.get("/tasks/:id", async (req, res) => {
    const _id = req.params.id;
  
    try {
      const task = await Task.findById(_id);
  
      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }
  
      res.send(task);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  module.exports = router;