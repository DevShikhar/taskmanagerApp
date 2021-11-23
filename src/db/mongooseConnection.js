const mongoose = require("mongoose");

(async function () {
	try {
		const connect = await mongoose.connect(
			"mongodb://127.0.0.1:27017/task-manager-api"
		);
		console.log("Connected to DB");
	} catch (error) {
		console.log(error);
	}
})();
