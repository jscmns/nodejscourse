const { validationResult } = require("express-validator");

const Product = require("../models/product");

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
	const { title, price, description, imageUrl } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render("admin/edit-product", {
			pageTitle: "Add product",
			path: "/admin/edit-product",
			editing: false,
			hasError: true,
			product: {
				title,
				price,
				description,
				imageUrl
			},
			isAuthenticated: req.user,
			errorMessage: errors.array()[0].msg,
			validationResult: errors
		});
	}
	const product = new Product({ title, price, description, imageUrl, userId: req.user._id });
	product
		.save()
		.then(() => res.redirect("/admin/products"))
		.catch(e => console.log(e));
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
	const { id, title, imageUrl, price, description } = req.body;

	const errors = validationResult(req);
	
	if (!errors.isEmpty()) {
		return res.status(422).render("admin/edit-product", {
			pageTitle: "Edit product",
			path: "/admin/edit-product",
			editing: true,
			hasError: true,
			product: {
				_id: id,
				title,
				price,
				description,
				imageUrl
			},
			isAuthenticated: req.user,
			errorMessage: errors.array()[0].msg,
			validationResult: errors
		});
	}

	Product.findById(id)
		.then(product => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect("/");
			}
			product.title = title;
			product.imageUrl = imageUrl;
			product.price = price;
			product.description = description;
			return product.save().then(() => res.redirect("/admin/products"));
		})
		.catch(e => console.log(e));
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
	Product.deleteOne({ id, userId: req.user._id })
		.then(() => res.redirect("/admin/products"))
		.catch(e => console.log(e));
};
