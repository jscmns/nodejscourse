const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

const renderIndexAndProducts = (req, res, next, fsPath, path, pageTitle) => {
	const page = parseInt(req.query.page) || 1;
	let totalItems;

	Product.find()
		.countDocuments()
		.then(numProducts => {
			totalItems = numProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then(products => {
			res.render(fsPath, {
				products,
				pageTitle,
				path,
				isAuthenticated: req.user,
				csrfToken: req.csrfToken(),
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
			});
		})
		.catch(e => next(e));
};

exports.getProducts = (req, res, next) => {
	return renderIndexAndProducts(req, res, next, "shop/product-list", "/products", "All products");
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
	return renderIndexAndProducts(req, res, next, "shop/index", "/", "Shop");
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
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.deleteCartItem = (req, res, next) => {
	const { id } = req.body;
	req.user
		.removeFromCart(id)
		.then(() => {
			res.redirect("/cart");
		})
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
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
		.catch(e => {
			console.log(e);
		});
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
		.catch(e => {
			const error = new Error(e);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCheckout = (req, res, next) => {
	let products;
	let totalSum = 0;
	req.user
		.populate("cart.items.productId")
		.then(user => {
			products = user.cart.items
			user.cart.items.forEach(item => (totalSum += item.quantity * item.productId.price));

			return stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				mode: "payment",
				line_items: products.map(p => {
					return {
						quantity: p.quantity,
						price_data: {
							currency: "usd",
							unit_amount: p.productId.price * 100,
							product_data: {
								name: p.productId.title,
								description: p.productId.description
							}
						}
					};
				}),
				success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
				cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel"
			});
		}).then(session => {
			res.render("shop/checkout", {
				path: "/checkout",
				pageTitle: "Checkout",
				products,
				isAuthenticated: req.user,
				totalSum,
				sessionId: session.id
			});
		})
		.catch(e => console.log(e));
};

exports.getInvoice = (req, res, next) => {
	const { orderId } = req.params;
	Order.findById(orderId)
		.then(order => {
			if (!order) {
				return next(new Error("No order found."));
			}
			if (order.user.userId.toString() !== req.user._id.toString()) {
				return next(new Error("Unauthorized."));
			}
			const invoiceName = `invoice-${orderId}.pdf`;
			const invoicePath = path.join("data", "invoices", invoiceName);

			const pdfDoc = new PDFDocument();
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			pdfDoc.pipe(res);
			pdfDoc.fontSize(26).text("Invoice", { underline: true });
			let totalPrice = 0;
			order.products.forEach(prod => {
				totalPrice += prod.quantity * prod.productData.price;
				pdfDoc
					.fontSize(14)
					.text(`${prod.productData.title} - ${prod.quantity} x $${prod.productData.price}`);
			});
			pdfDoc.text("------------------------------------------------------");
			pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

			pdfDoc.end();
			// fs.readFile(invoicePath, (err, data) => {
			// 	if (err) {
			// 		return next(err);
			// 	}
			// 	res.setHeader("Content-Type", "application/pdf");
			// 	res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
			// 	res.send(data);
		})
		.catch(e => {
			next(e);
		});
};
