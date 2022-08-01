const Product = require("../models/product");

exports.getAddProductPage = (req, res, next) => {
	res.render("admin/edit-product", {
		pageTitle: "Add product",
		path: "/admin/add-product",
		editing: false
	});
};

exports.postProduct = (req, res, next) => {
	const { title, imageUrl, price, description } = req.body;
	const product = new Product(null, title, imageUrl, price, description);
	product.save();
	res.redirect("/");
};

exports.getEditProduct = (req, res, next) => {
	const editing = req.query.editing;
	const { productId } = req.params;
	if (!editing) return res.redirect("/");
	Product.findById(productId, product => {
		if (!product) return res.redirect("/");
		res.render("admin/edit-product", {
			pageTitle: "Edit product",
			path: "/admin/edit-product",
			editing,
			product
		});
	});
};

exports.postEditProduct = (req, res, next) => {
	const { id, title, imageUrl, price, description } = req.body;
	const product = new Product(id, title, imageUrl, price, description);
	product.save();
	res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
	Product.fetchAll(products => {
		res.render("admin/products", {
			products: products,
			pageTitle: "Admin products",
			path: "/admin/products"
		});
	});
};

exports.deleteProduct = (req, res, next) => {
	const { productId: id } = req.params;
	Product.delete(id);
	res.redirect("/admin/products");
};
