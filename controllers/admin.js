const { validationResult } = require("express-validator");
const { deleteFile } = require("../utils/file");

const Product = require("../models/product");

const responseStatus422 = (
	pageTitle,
	editing,
	product,
	errorMessage,
	validationResult,
	req,
	res,
	next
) => {
	return res.status(422).render("admin/edit-product", {
		pageTitle,
		path: "/admin/edit-product",
		editing,
		hasError: true,
		product,
		isAuthenticated: req.user,
		errorMessage,
		validationResult
	});
};

exports.getAdminAddProductPage = (req, res, next) => {
	res.render("admin/edit-product", {
		pageTitle: "Add product",
		path: "/admin/add-product",
		editing: false,
		isAuthenticated: req.user,
		hasError: false,
		errorMessage: null,
		validationResult: []
	});
};

exports.postProduct = (req, res, next) => {
	const { title, price, description } = req.body;
	const image = req.file;
	const errors = validationResult(req);
	if (!errors.isEmpty() || !image) {
		return responseStatus422(
			"Add product",
			false,
			{
				title,
				price,
				description
			},
			!image ? "Attached file is not an image" : errors.array()[0].msg,
			!image ? [] : errors.array(),
			req,
			res,
			next
		);
	}

	const imageUrl = image.path;

	const product = new Product({ title, price, description, image: imageUrl, userId: req.user._id });
	product
		.save()
		.then(() => res.redirect("/admin/products"))
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProductToEdit = (req, res, next) => {
	const editing = req.query.editing;
	const { id } = req.params;
	if (!editing) return res.redirect("/");
	Product.findById(id)
		.then(product => {
			if (!product) return res.redirect("/");
			res.render("admin/edit-product", {
				pageTitle: "Edit product",
				path: "/admin/edit-product",
				editing,
				product,
				hasError: false,
				isAuthenticated: req.user,
				errorMessage: null,
				validationResult: []
			});
		})
		.catch(e => console.log(e));
};

exports.updateProduct = (req, res, next) => {
	const { id, title, price, description } = req.body;

	const image = req.file;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return responseStatus422(
			"Add product",
			true,
			{
				_id: id,
				title,
				price,
				description
			},
			errors.array()[0].msg,
			errors.array(),
			req,
			res,
			next
		);
	}

	Product.findById(id)
		.then(product => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect("/");
			}
			product.title = title;
			if (image) {
				deleteFile(product.image);
				product.image = image.path;
			}
			product.price = price;
			product.description = description;
			return product.save().then(() => res.redirect("/admin/products"));
		})
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getAdminProducts = (req, res, next) => {
	Product.find({ userId: req.user._id })
		.populate("userId")
		.then(products => {
			res.render("admin/products", {
				products,
				pageTitle: "Admin products",
				path: "/admin/products",
				isAuthenticated: req.user
			});
		})
		.catch(e => console.log(e));
};

exports.deleteProduct = (req, res, next) => {
	const { id } = req.params;
	Product.findById(id)
		.then(product => {
			if (!product) {
				return next(new Error("Product not found"));
			}
			deleteFile(product.image);
			return Product.deleteOne({ id, userId: req.user._id });
		})
		.then(() => res.status(200).json({ message: "Success" }))
		.catch(e => {
			res.status(500).json({ message: "Deleting product failed!" });
		})
		.catch(e => next(e));
};
