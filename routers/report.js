const express = require("express");
const Reporting = require("../repository/report");
const router = new express.Router();

router.get("/reports/completion-by-period", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .send({ error: "startDate and endDate are required" });
  }

  try {
    const report = await Reporting.taskCompletionByTimePeriod(
      startDate,
      endDate
    );
    res.send(report);
  } catch (error) {
    res
      .status(500)
      .send({
        error: "Error generating report by time period: " + error.message,
      });
  }
});

router.get("/reports/completion-by-member", async (req, res) => {
  try {
    const report = await Reporting.taskCompletionByTeamMember();
    res.send(report);
  } catch (error) {
    res
      .status(500)
      .send({
        error: "Error generating report by team member: " + error.message,
      });
  }
});

module.exports = router;
