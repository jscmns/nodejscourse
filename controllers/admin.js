const Product = require("../models/product");
const productLoader = require("../utils/utils").productLoader;
const productLoaderForUser = require("../utils/utils").productLoaderForUser;

exports.getAdminAddProductPage = (req, res, next) => {
	res.render("admin/edit-product", {
		pageTitle: "Add product",
		path: "/admin/add-product",
		editing: false
	});
};

exports.postProduct = (req, res, next) => {
	const { title, imageUrl, price, description } = req.body;
	req.user
		.createProduct({ title, imageUrl, price, description })
		.then(() => res.redirect("/admin/products"))
		.catch(e => console.log(e));
};

exports.getProductToEdit = (req, res, next) => {
	const editing = req.query.editing;
	const { id } = req.params;
	if (!editing) return res.redirect("/");
	req.user
		.getProducts({ where: { id } })
		.then(product => {
			if (!product) return res.redirect("/");
			res.render("admin/edit-product", {
				pageTitle: "Edit product",
				path: "/admin/edit-product",
				editing,
				product
			});
		})
		.catch(e => console.log(e));
};

exports.updateProduct = (req, res, next) => {
	const { id, title, imageUrl, price, description } = req.body;
	Product.findByPk(id)
		.then(product => {
			product.update({ title, imageUrl, price, description });
			res.redirect("/admin/products");
		})
		.catch(e => console.log(e));
};

exports.getAdminProducts = (req, res, next) => {
	productLoaderForUser(req, res, next, {
		route: "admin/products",
		pageTitle: "Admin products",
		path: "/admin/products"
	});
};

exports.deleteProduct = (req, res, next) => {
	const { id } = req.params;
	Product.destroy({ where: { id } })
		.then(() => res.redirect("/admin/products"))
		.catch(e => console.log(e));
};
