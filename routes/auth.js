const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const authController = require("../controllers/auth");
const User = require("../models/user");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
	"/login",
	[
		check("email", "Please enter a valid email.").isEmail().normalizeEmail(),
		check("password", "Please enter a valid password.")
			.isLength({ min: 6 })
			.isAlphanumeric()
			.trim()
	],
	authController.login
);

router.post(
	"/signup",
	[
		check("email", "Please enter a valid email.")
			.isEmail().normalizeEmail()
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then(user => {
					if (user) {
						return Promise.reject("E-mail already exists.");
					}
				});
			}),
		check("password", "Please enter a valid password.").isLength({ min: 6 }).isAlphanumeric().trim(),
		check("confirmPassword", "Passwords do not match.").custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords do not match.");
			}
			return true;
		})
	],
	authController.signup
);

router.post("/logout", authController.logout);

router.get("/reset", authController.getResetPage);

router.post("/reset", authController.reset);

router.get("/reset/:token", authController.getNewPasswordPage);

router.post("/new-password", authController.newPassword);

module.exports = router;
