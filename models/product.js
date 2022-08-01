const fs = require("fs");
const path = require("path");
const prodsPath = path.join(path.dirname(require.main.filename), "data", "products.json");
const Cart = require('./cart')

const getProductsFromFile = cb => {
	fs.readFile(prodsPath, (err, fileContent) => {
		(JSON.parse(fileContent))
		if (err) return cb([]);
		cb(JSON.parse(fileContent));
	});
};

module.exports = class Product {
	constructor(id, title, imageUrl, price, description) {
		this.id = id;
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
	}

	save() {
		getProductsFromFile(products => {
			if (this.id) {
				const existingProductIndex = products.findIndex(product => product.id === this.id);
				const updatedProducts = [...products];
				updatedProducts[existingProductIndex] = {...this};
				return fs.writeFile(prodsPath, JSON.stringify(updatedProducts), err => {
					("ERROR: ", err);
				});
			}
			this.id = Math.random().toString();
			products.push(this);
			fs.writeFile(prodsPath, JSON.stringify(products), err => {
				("ERROR: ", err);
			});
		});
	}

	static fetchAll(cb) {
		getProductsFromFile(cb);
	}

	static findById(id, cb) {
		getProductsFromFile(products => {
			const product = products.find(p => p.id === id);
			(product)
			cb(product);
		});
	}

	static delete(id) {
		getProductsFromFile(products => {
			const product = products.find(prod => prod.id === id);
			const updatedProducts = products.filter(p => p.id !== id);
			fs.writeFile(prodsPath, JSON.stringify(updatedProducts), err => {
				if (!err) {
					Cart.deleteProduct(id, product.price);
				}
			});
		});
	}
};
