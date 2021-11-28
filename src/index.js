const express = require("express");
const Urouter = require("./routes/user");
const Trouter = require("./routes/task");
require("dotenv").config();
const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(Urouter);
app.use(Trouter);

app.listen(port, () => {
	console.log(`Server Running at ${port}`);
});
