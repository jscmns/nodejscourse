const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
	Product.fetchAll(products => {
		res.render("shop/product-list", {
			products,
			pageTitle: "All products",
			path: "/products"
		});
	});
};

exports.getProduct = (req, res, next) => {
	const productId = req.params.productId;
	Product.findById(productId, product => {
		res.render("shop/product-detail", {
			product,
			pageTitle: product.title,
			path: "/products"
		});
	});
};

exports.getIndex = (req, res, next) => {
	Product.fetchAll(products => {
		res.render("shop/index", {
			products,
			pageTitle: "Shop",
			path: "/"
		});
	});
};

exports.getCart = (req, res, next) => {
	Cart.getCart(cart => {
		Product.fetchAll(products => {
			const cartProducts = [];
			for (product of products) {
				if (!cart) return res.redirect("/");
				if (cart.products.find(prod => prod.id === product.id)) {
					cartProducts.push({
						productData: product,
						quantity: cart.products.find(prod => prod.id === product.id).quantity
					});
				}
			}
			res.render("shop/cart", {
				path: "/cart",
				pageTitle: "Your cart",
				products: cartProducts
			});
		});
	});
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId, product => {
		Cart.addProduct(prodId, product.price);
	});
	res.redirect("/cart");
};

exports.deleteCartItem = (req, res, next) => {
	const { id } = req.body;
	Product.findById(id, product => { 
		Cart.deleteProduct(id, product.price);
		res.redirect("/cart");
	});
};

exports.getOrders = (req, res, next) => {
	res.render("shop/orders", {
		path: "/orders",
		pageTitle: "Your orders"
	});
};

exports.getCheckout = (req, res, next) => {
	res.render("/shop/checkout", { path: "/checkout", pageTitle: "Checkout" });
};
