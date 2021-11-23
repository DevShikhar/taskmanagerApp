const express = require("express");
const Urouter = require("./routes/user");
const Trouter = require("./routes/task");
const app = express();

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(Urouter);
app.use(Trouter);

app.listen(port, () => {
	console.log("Server running");
});

// const task = require("./model/taskschema");
// const tmUser = require("./model/userschema");
// const test = async () => {
// 	// const val = await task.findById("6198f6f3b07406dc89157e81");
// 	// await val.populate("owner");
// 	// console.log(val.owner);
// 	const val = await tmUser.findById("6198f06cfbaf326070773efc");
// 	await val.populate("tasks");
// 	console.log(val.tasks);
// };

// test();
