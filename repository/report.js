const Task = require("../models/task");

const Reporting = {
  async taskCompletionByTimePeriod(startDate, endDate) {
    try {
      const report = await Task.aggregate([
        {
          $match: {
            completed: true,
            updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $group: {
            _id: null,
            totalCompletedTasks: { $sum: 1 },
            avgCompletionTime: {
              $avg: { $subtract: ["$updatedAt", "$createdAt"] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalCompletedTasks: 1,
            avgCompletionTimeInHours: {
              $divide: ["$avgCompletionTime", 1000 * 60 * 60],
            },
          },
        },
      ]);
      return report.length
        ? report[0]
        : { totalCompletedTasks: 0, avgCompletionTimeInHours: 0 };
    } catch (error) {
      throw new Error(
        "Error generating report by time period: " + error.message
      );
    }
  },

  async taskCompletionByTeamMember() {
    try {
      const report = await Task.aggregate([
        {
          $match: { completed: true },
        },
        {
          $group: {
            _id: "$assignedMember",
            totalCompletedTasks: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            assignedMember: "$_id",
            totalCompletedTasks: 1,
          },
        },
      ]);
      return report;
    } catch (error) {
      throw new Error(
        "Error generating report by team member: " + error.message
      );
    }
  },
};

module.exports = Reporting;
