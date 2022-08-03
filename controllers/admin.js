const Product = require("../models/product");
const { ObjectId } = require("mongodb");

exports.getAdminAddProductPage = (req, res, next) => {
	res.render("admin/edit-product", {
		pageTitle: "Add product",
		path: "/admin/add-product",
		editing: false
	});
};

exports.postProduct = (req, res, next) => {
	const { title, price, description, imageUrl } = req.body;
	const product = new Product(title, price, description, imageUrl, null, req.user._id);
	product
		.saveOrUpdate()
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
				product
			});
		})
		.catch(e => console.log(e));
};

exports.updateProduct = (req, res, next) => {
	const { id, title, imageUrl, price, description } = req.body;
	const product = new Product(title, price, description, imageUrl, new ObjectId(id), req.user._id);
	product
		.saveOrUpdate()
		.then(() => res.redirect("/admin/products"))
		.catch(e => console.log(e));
};

exports.getAdminProducts = (req, res, next) => {
	Product.fetchAll()
		.then(products => {
			res.render("admin/products", {
				products,
				pageTitle: "Admin products",
				path: "/admin/products"
			});
		})
		.catch(e => console.log(e));
};

exports.deleteProduct = (req, res, next) => {
	const { id } = req.params;
	Product.delete(id)
		.then(() => res.redirect("/admin/products"))
		.catch(e => console.log(e));
};
