const crypto = require("crypto");

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const transport = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "769aac89b0cebc",
		pass: "39f1e94a204bbb"
	}
});

exports.getLogin = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/login", {
		path: "/login",
		pageTitle: "Login",
		errorMessage: message,
		oldInput: {
			email: "",
			password: ""
		},
		validationResult: []
	});
};

exports.getSignup = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/signup", {
		path: "/signup",
		pageTitle: "Signup",
		errorMessage: message,
		oldInput: {
			email: "",
			password: "",
			confirmPassword: ""
		},
		validationResult: []
	});
};

exports.login = (req, res, next) => {
	const { email, password } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth/login", {
			path: "/login",
			pageTitle: "Login",
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email,
				password
			},
			validationResult: errors
		});
	}
	User.findOne({ email })
		.then(user => {
			if (!user) {
				return res.status(422).render("auth/login", {
					path: "/login",
					pageTitle: "Login",
					errorMessage: "Invalid email or password.",
					oldInput: {
						email,
						password
					},
					validationResult: []
				});
			}
			bcrypt
				.compare(password, user.password)
				.then(doMatch => {
					if (doMatch) {
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save(e => {
							res.redirect("/");
						});
					} else {
						return res.status(422).render("auth/login", {
							path: "/login",
							pageTitle: "Login",
							errorMessage: "Invalid email or password.",
							oldInput: {
								email,
								password
							},
							validationResult: []
						});
					}
				})
				.catch(e => {
					console.log(e);
					res.redirect("/login");
				});
		})
		.catch(err => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.logout = (req, res, next) => {
	req.session.destroy(e => {
		if (e) console.log(e);
		res.redirect("/");
	});
};

exports.signup = (req, res, next) => {
	const { email, password, confirmPassword } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth/signup", {
			path: "/signup",
			pageTitle: "Signup",
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email,
				password,
				confirmPassword
			},
			validationResult: errors
		});
	}
	return bcrypt
		.hash(password, 12)
		.then(hashedPassword => {
			const user = new User({ email, password: hashedPassword, cart: { items: [] } });
			return user.save();
		})
		.then(() => {
			res.redirect("/login");
			return transport.sendMail({
				to: email,
				from: "nodecourse@mail.com",
				subject: "Signup succeeded!",
				html: "<h1>You successfully signed up!</h1>"
			});
		})
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getResetPage = (req, res, next) => {
	let message = req.flash("error");
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render("auth/reset", {
		path: "/reset",
		pageTitle: "Reset password",
		errorMessage: message
	});
};

exports.reset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect("/reset");
		}
		const token = buffer.toString("hex");
		User.findOne({ email: req.body.email })
			.then(user => {
				if (!user) {
					req.flash("error", "No account with that email found.");
					return res.redirect("/reset");
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600000;
				return user.save();
			})
			.then(() => {
				res.redirect("/");
				return transport.sendMail({
					to: req.body.email,
					from: "nodecourse@mail.com",
					subject: "Password reset",
					html: `
					<p>You requested a password reset</p>
					<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
					`
				});
			})
			.catch(e => {
				const error = new Error(e);
				error.httpStatusCode = 500;
				return next(error);
			});
	});
};

exports.getNewPasswordPage = (req, res, next) => {
	const token = req.params.token;
	User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
		.then(user => {
			let message = req.flash("error");
			if (message.length > 0) {
				message = message[0];
			} else {
				message = null;
			}
			res.render("auth/new-password", {
				path: "/new-password",
				pageTitle: "New password",
				errorMessage: message,
				userId: user._id.toString(),
				passwordToken: token
			});
		})
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.newPassword = (req, res, next) => {
	const newPassword = req.body.password;
	const userId = req.body.userId;
	const passwordToken = req.body.passwordToken;
	let resetUser;

	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId
	})
		.then(user => {
			resetUser = user;
			return bcrypt.hash(newPassword, 12);
		})
		.then(hashedPassword => {
			return User.findOneAndUpdate(
				{
					resetToken: passwordToken,
					resetTokenExpiration: { $gt: Date.now() },
					_id: userId
				},
				{
					$set: {
						password: hashedPassword,
						resetToken: undefined,
						resetTokenExpiration: undefined
					}
				}
			);
		})
		.then(res.redirect("/login"))
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};
