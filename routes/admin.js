const express = require("express");
const path = require("path");
const rootDir = require("../utils/path");
const router = express.Router();
const users = [];

router.get("/users", (req, res, next) => {
	res.render("users", {
		pageTitle: "users",
		users: users,
		path: "admin/users",
    // activeAddProduct: true,
    formsCSS: true,
    // productCSS: true,
    // activeAddProduct: true
	});
});

router.post("/add-user", (req, res, next) => {
	users.push({ username: req.body.username });
	res.redirect("/admin/users");
});

exports.routes = router;
exports.users = users;
