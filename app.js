const express = require("express");
require("./db/mongoose");
const taskRouter = require("./routers/task");
const reportRouter = require("./routers/report");

const app = express();
const port = 3000;

app.use(express.json());
app.use(taskRouter);
app.use(reportRouter);

module.exports = app;
