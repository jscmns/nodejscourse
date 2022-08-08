const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");
const router = express.Router();

router.get("/add-product", isAuth, adminController.getAdminAddProductPage);

router.get("/products", isAuth, adminController.getAdminProducts);

router.post(
	"/add-product",
	[
		body("title").isString().isLength({ min: 3 }).trim(),
		body("description").isString().isLength({ min: 8, max: 400 }).trim(),
		body("imageUrl").isURL(),
		body("price").isFloat()
	],
	isAuth,
	adminController.postProduct
);

router.get("/edit-product/:id", isAuth, adminController.getProductToEdit);

router.post(
	"/edit-product",
	[
		body("title").isString().isLength({ min: 3 }).trim(),
		body("description").isString().isLength({ min: 8, max: 400 }).trim(),
		body("imageUrl").isURL(),
		body("price").isFloat()
	],
	isAuth,
	adminController.updateProduct
);

router.post("/delete-product/:id", isAuth, adminController.deleteProduct);

module.exports = router;
