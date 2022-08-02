const Product = require("../models/product");

exports.productLoader = (req, res, next, { ...rest }) => {
	Product.findAll()
		.then(products => {
			res.render(rest.route, { products, pageTitle: rest.pageTitle, path: rest.path });
		})
		.catch(e => console.log(e));
};

exports.productLoaderForUser = (req, res, next, { ...rest }) => {
	req.user
		.getProducts()
		.then(products => {
			res.render(rest.route, { products, pageTitle: rest.pageTitle, path: rest.path });
		})
		.catch(e => console.log(e));
};
