const fs = require("fs");
const path = require("path");
const cartPath = path.join(path.dirname(require.main.filename), "data", "cart.json");

module.exports = class Cart {
	static addProduct(id, productPrice) {
		fs.readFile(cartPath, (err, fileContent) => {
			let cart = {};
			if (err) {
				cart = { products: [], totalPrice: 0 };
			} else {
				cart = { ...JSON.parse(fileContent) };
			}
			const existingProductIndex = cart.products.findIndex(p => p.id === id);
			const existingProduct = cart.products[existingProductIndex];
			let updatedProduct;
			if (existingProduct) {
				updatedProduct = { ...existingProduct };
				updatedProduct.quantity++;
				cart.products = [...cart.products];
				cart.products[existingProductIndex] = updatedProduct;
			} else {
				const newProduct = { id, quantity: 1 };
				cart.products.push(newProduct)
			}
			cart.totalPrice = cart.totalPrice + parseInt(productPrice);
			fs.writeFile(cartPath, JSON.stringify(cart), err => {
				err;
			});
		});
	}

	static deleteProduct(id, productPrice) {
		fs.readFile(cartPath, (err, fileContent) => {
			if (err) return;
			const cart = { ...JSON.parse(fileContent) };
			const product = cart.products.find(p => p.id === id);
			if (!product) return;
			const productQty = product.quantity;
			const updatedCart = { ...cart };
			updatedCart.products = updatedCart.products.filter(p => p.id !== id);
			updatedCart.totalPrice = cart.totalPrice - productPrice * productQty;
			fs.writeFile(cartPath, JSON.stringify(updatedCart), err => {
				err;
			});
		});
	}

	static getCart(cb) {
		fs.readFile(cartPath, (err, fileContent) => {
			if (err) {
				cb(null);
			} else {
				const cart = JSON.parse(fileContent);
				cb(cart);
			}
		});
	}
};
