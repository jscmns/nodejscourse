const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render("shop/product-list", {
				products,
				pageTitle: "All products",
				path: "/products",
				isAuthenticated: req.user
			});
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
				path: "/products",
				isAuthenticated: req.user
			});
		})
		.catch(e => console.log(e));
};

exports.getIndex = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render("shop/index", {
				products,
				pageTitle: "Shop",
				path: "/",
				isAuthenticated: req.user,
				csrfToken: req.csrfToken()
			});
		})
		.catch(e => console.log(e));
};

exports.getCart = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then(user => {
			res.render("shop/cart", {
				path: "/cart",
				pageTitle: "Your cart",
				products: user.cart.items,
				isAuthenticated: req.user
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
		.removeFromCart(id)
		.then(() => {
			res.redirect("/cart");
		})
		.catch(e => console.log(e));
};

exports.getOrders = (req, res, next) => {
	Order.find({ "user.userId": req.user._id })
		.then(orders => {
			res.render("shop/orders", {
				path: "/orders",
				pageTitle: "Your orders",
				orders,
				isAuthenticated: req.user
			});
		})
		.catch(e => console.log(e));
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then(user => {
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, productData: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user
				},
				products
			});
			return order.save();
		})
		.then(() => {
			return req.user.clearCart();
		})
		.then(() => res.redirect("/orders"))
		.catch(e => console.log(e));
};

exports.getCheckout = (req, res, next) => {
	res.render("/shop/checkout", {
		path: "/checkout",
		pageTitle: "Checkout",
		isAuthenticated: req.user
	});
};
