const express = require("express");
const router = express.Router();
const task = require("../model/taskschema");
const auth = require("../middlewares/authentication");

router.get("/", (req, res) => {
	res.send("Hello");
});

router.get("/tasks/me", auth, async (req, res) => {
	const match = {};
	const sort = {};
	const sortingCriteria = req.query.sortBy;
	if (req.query.completed) {
		match.completed = req.query.completed === "true" ? true : false;
	}

	let sortBy = [];
	sortBy = sortBy.concat(sortingCriteria);
	if (sortingCriteria) {
		sortBy.forEach((part) => {
			const sorting = part.split(":");
			sort[sorting[0]] = sorting[1] === "asc" ? 1 : -1;
		});
	}

	try {
		const result = await req.user.populate({
			path: "tasks",
			match,
			options: {
				limit: Number(req.query.limit),
				skip: Number(req.query.skip),
				sort,
			},
		});
		if (result.tasks.length === 0) {
			return res.send("No tasks found");
		}
		res.status(200).send(result.tasks);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

router.post("/newTask", auth, async (req, res) => {
	const usertask = req.body;
	usertask.owner = req.user._id;
	const newtask = new task(usertask);
	try {
		const result = await newtask.save();
		res.status(201).send(result);
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});

router.patch("/taskUpdate/:id", auth, async (req, res) => {
	try {
		const id = req.params.id;
		const update = req.body;
		const updateFields = Object.keys(update);
		const allowedUpdates = ["description", "completed"];
		const isValidUpdate = updateFields.every((field) =>
			allowedUpdates.includes(field)
		);
		if (!isValidUpdate) throw new Error("Invalid field update");

		const taskToUpdate = await task.findOne({ _id: id, owner: req.user._id });
		if (!taskToUpdate) {
			return res.status(404).send({ Error: "Task not found to update" });
		}

		updateFields.forEach((field) => {
			taskToUpdate[field] = update[field];
		});

		await taskToUpdate.save();
		res.send(taskToUpdate);
	} catch (error) {
		console.log(error.message);
		res.status(400).send(error);
	}
});

router.delete("/deleteTask/:id", auth, async (req, res) => {
	try {
		const id = req.params.id;
		const taskToDelete = await task.findOneAndDelete({
			_id: id,
			owner: req.user._id,
		});
		// const userTaskList = await req.user.populate("tasks");
		// const taskToDelete = userTaskList.tasks.find(
		// 	(task) => task._id.toString() === id
		// );
		if (!taskToDelete) {
			return res.send("No Task Found");
		}
		await taskToDelete.remove();
		res.send({ Success: "Task Deleted Successfully" });
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});

module.exports = router;
