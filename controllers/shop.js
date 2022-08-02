const Product = require("../models/product");
const productLoader = require("../utils/utils").productLoader;

exports.getProducts = (req, res, next) => {
	productLoader(req, res, next, {
		route: "shop/product-list",
		pageTitle: "All products",
		path: "/products"
	});
};

exports.getProduct = (req, res, next) => {
	const { id } = req.params;
	Product.findByPk(id)
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
	productLoader(req, res, next, { route: "shop/index", pageTitle: "Shop", path: "/" });
};

exports.getCart = (req, res, next) => {
	req.user
		.getCart()
		.then(cart => {
			return cart
				.getProducts()
				.then(products => {
					res.render("shop/cart", {
						path: "/cart",
						pageTitle: "Your cart",
						products
					});
				})
				.catch(e => console.log(e));
		})
		.catch(e => console.log(e));
};

exports.postCart = (req, res, next) => {
	const { id } = req.body;
	let newQuantity = 1;
	let _cart;
	req.user
		.getCart()
		.then(cart => {
			_cart = cart;
			return cart.getProducts({ where: { id } }).then(products => {
				let product;
				if (products.length > 0) product = products[0];
				if (product) {
					const oldQuantity = product.cartItem.quantity;
					newQuantity = oldQuantity + 1;
					return product;
				}
				return Product.findByPk(id);
			});
		})
		.then(product => {
			return _cart.addProduct(product, { through: { quantity: newQuantity } });
		})
		.then(() => {
			res.redirect("/cart");
		})
		.catch(e => console.log(e));
};

exports.deleteCartItem = (req, res, next) => {
	const { id } = req.body;
	req.user
		.getCart()
		.then(cart => {
			console.log("Cart", cart);
			return cart.getProducts({ where: { id } });
		})
		.then(products => {
			console.log(products);
			const product = products[0];
			return product.cartItem.destroy();
		})
		.then(() => {
			res.redirect("/cart");
		})
		.catch(e => console.log(e));
};

exports.getOrders = (req, res, next) => {
	req.user
		.getOrders({ include: ["products"] })
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
	let _cart;
	req.user
		.getCart()
		.then(cart => {
			_cart = cart;
			return cart.getProducts();
		})
		.then(products => {
			return req.user
				.createOrder()
				.then(order => {
					order.addProducts(
						products.map(product => {
							product.orderItem = { quantity: product.cartItem.quantity };
							return product;
						})
					);
				})
				.catch(e => console.log(e));
		})
		.then(() => {
			return _cart.setProducts(null);
		})
		.then(() => {
			res.redirect("/orders");
		})
		.catch(e => console.log(e));
};

exports.getCheckout = (req, res, next) => {
	res.render("/shop/checkout", { path: "/checkout", pageTitle: "Checkout" });
};
