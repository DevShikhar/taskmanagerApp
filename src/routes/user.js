const express = require("express");
const router = express.Router();
const tmUser = require("../model/userschema");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/authentication");
const multer = require("multer");
const sharp = require("sharp");

router.get("/", (req, res) => {
	res.send("Hello");
});
router.get("/users/me", auth, async (req, res) => {
	try {
		// const result = await tmUser.find();
		res.status(200).send(req.user);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});
router.post("/newUser", async (req, res) => {
	const userdata = req.body;
	const user = new tmUser(userdata);
	try {
		const token = await user.findByToken();
		res.status(201).send({ user, token });
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});
router.patch("/userUpdate/me", auth, async (req, res) => {
	try {
		const updates = req.body;
		const user = req.user;
		const updateFields = Object.keys(updates);
		const userFields = ["fname", "age", "email", "password"];
		const isValidUpdate = updateFields.every((field) =>
			userFields.includes(field)
		);
		if (!isValidUpdate) {
			throw new Error("Error: Invalid field update");
		}
		updateFields.forEach((update) => (user[update] = updates[update]));
		const result = await user.save();
		res.send(result);
	} catch (error) {
		console.log(error.message);
		res.status(400).send(error);
	}
});
router.delete("/deleteUser/me", auth, async (req, res) => {
	try {
		await req.user.remove();
		res.send({ Success: "Deleted You Successfully" });
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});

router.post("/userLogin", async (req, res) => {
	try {
		const user = await tmUser.findByCredentials(
			req.body.email,
			req.body.password
		);
		const token = await user.findByToken();
		const tk = jwt.verify(token, "taskmanagerapi");
		res.send({ user, token });
	} catch (error) {
		console.log(error);
		res.status(400).send({ Error: error.message });
	}
});

router.post("/userLogout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			(token) => token.token !== req.token
		);
		await req.user.save();
		res.send(`${req.user.fname} is logged out`);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

router.post("/userLogoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send("Loged out from all devices");
	} catch (error) {
		res.status(500).send(error);
	}
});

const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error("Only jpg,jpeg,png extensions allowed"));
		}
		cb(undefined, true);
	},
});
router.post(
	"/users/me/avatar",
	auth,
	upload.single("avatar"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.get("/users/:id/avatar", async (req, res) => {
	try {
		const user = await tmUser.findById(req.params.id);
		if (!user || !user.avatar) {
			throw new Error("No user or avatar found");
		}
		res.set("Content-Type", "image/png");
		res.send(user.avatar);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.delete("/users/me/avatar", auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.send();
});

module.exports = router;
