const tmUser = require("../model/userschema");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decode = jwt.verify(token, "taskmanagerapi");
		const user = await tmUser.findOne({
			_id: decode._id,
			"tokens.token": token,
		});
		if (!user) {
			throw new Error();
		}
		req.token = token;
		req.user = user;
		next();
	} catch (error) {
		res.status(401).send({ error: "Please Authenticate" });
	}
};

module.exports = auth;
