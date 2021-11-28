const mongoose = require("mongoose");
require("dotenv").config();

(async function () {
	try {
		const connect = await mongoose.connect(process.env.MONGODB_CONNECTION);
		console.log("Connected to DB");
	} catch (error) {
		console.log(error);
	}
})();
