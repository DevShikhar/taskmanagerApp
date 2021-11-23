const mongoose = require("mongoose");
const validator = require("validator");
require("../db/mongooseConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const task = require("./taskschema");

const userSchema = new mongoose.Schema(
	{
		fname: {
			type: String,
			required: true,
			trim: true,
		},
		age: {
			type: Number,
			validate(val) {
				if (val < 0) {
					throw new Error("Enter valid age");
				}
			},
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			validate(val) {
				if (!validator.isEmail(val)) {
					throw new Error("Enter valid Email");
				}
			},
		},
		password: {
			type: String,
			required: true,
			validate(val) {
				if (val.length < 4) {
					throw new Error("Minimum password length is 4 characters");
				} else if (val.toLowerCase().includes("password")) {
					throw new Error('Password should not contain "password"');
				}
			},
		},
		avatar: {
			type: Buffer,
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

userSchema.virtual("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "owner",
});

userSchema.methods.toJSON = function () {
	const userObject = this.toObject();
	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatars;

	return userObject;
};

userSchema.methods.findByToken = async function () {
	const token = jwt.sign({ _id: this._id.toString() }, "taskmanagerapi", {
		expiresIn: "5 days",
	});
	this.tokens = [...this.tokens, { token }];
	await this.save();
	return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const result = await tmUser.findOne({ email });
	if (!result) {
		throw new Error("Unable to login");
	}
	const isMatch = await bcrypt.compare(password, result.password);
	if (!isMatch) {
		throw new Error("Unable to login");
	}
	return result;
};

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		const result = await bcrypt.hash(this.password, 10);
		this.password = result;
	}
	next();
});

userSchema.pre("remove", async function (next) {
	await task.deleteMany({ owner: this._id });
	next();
});

const tmUser = mongoose.model("User", userSchema);

module.exports = tmUser;
