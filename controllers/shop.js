const Product = require("../models/product");
const productLoader = require("../utils/utils").productLoader;

exports.getProducts = (req, res, next) => {
	Product.fetchAll()
		.then(products => {
			res.render("shop/product-list", { products, pageTitle: "All products", path: "/products" });
		})
		.catch(e => console.log(e));
};

exports.getProduct = (req, res, next) => {
	const { id } = req.params;
	Product.findById(id)
		.then(product => {
			res.render("shop/product-detail", {
				product,
				pageTitle: product.title,
				path: "/products"
			});
		})
		.catch(e => console.log(e));
};

exports.getIndex = (req, res, next) => {
	Product.fetchAll()
		.then(products => {
			res.render("shop/index", { products, pageTitle: "Shop", path: "/" });
		})
		.catch(e => console.log(e));
};

exports.getCart = (req, res, next) => {
	req.user
		.getCart()
		.then(products => {
			res.render("shop/cart", {
				path: "/cart",
				pageTitle: "Your cart",
				products
			});
		})
		.catch(e => console.log(e));
};

exports.postCart = (req, res, next) => {
	const { id } = req.body;
	Product.findById(id)
		.then(product => {
			req.user.addToCart(product);
			res.redirect("/cart");
		})
		.catch(e => console.log(e));
};

exports.deleteCartItem = (req, res, next) => {
	const { id } = req.body;
	req.user
		.deleteCartItem(id)
		.then(() => {
			res.redirect("/cart");
		})
		.catch(e => console.log(e));
};

exports.getOrders = (req, res, next) => {
	req.user
		.getOrders()
		.then(orders => {
			res.render("shop/orders", {
				path: "/orders",
				pageTitle: "Your orders",
				orders
			});
		})
		.catch(e => console.log(e));
};

exports.postOrder = (req, res, next) => {
	req.user
		.addOrder()
		.then(() => {
			res.redirect("/orders");
		})
		.catch(e => console.log(e));
};

exports.getCheckout = (req, res, next) => {
	res.render("/shop/checkout", { path: "/checkout", pageTitle: "Checkout" });
};
