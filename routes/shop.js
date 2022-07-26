const path = require("path");
const express = require("express");
const rootDir = require("../utils/path");
const router = express.Router();
const adminData = require("./admin");

router.get("/", (req, res, next) => {
	// const users = adminData.users;
	res.render("add-user", {
		pageTitle: "Add user",
		path: "/",
		// hasProducts: products.length > 0,
    // activeShop: true,
    productCSS: true
	});
});

module.exports = router;
