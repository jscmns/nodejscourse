const { getDb } = require("../utils/database");
const mongodb = require("mongodb");

class User {
	constructor(username, email, id, cart) {
		this.username = username;
		this.email = email;
		this._id = id ? new mongodb.ObjectId(id) : null;
		this.cart = cart;
	}

	saveOrUpdate() {
		const db = getDb();
		if (this._id) {
			return db
				.collection("users")
				.updateOne({ _id: this._id }, { $set: this })
				.then(res => console.log(res))
				.catch(e => console.log(e));
		}
		return db
			.collection("users")
			.insertOne(this)
			.then(res => console.log(res))
			.catch(e => console.log(e));
	}

	addToCart(product) {
		const cartProductIndex = this.cart.items.findIndex(
			item => item.productId.toString() === product._id.toString()
		);
		let newQuantity = 1;
		const updatedCartItems = [...this.cart.items];
		if (cartProductIndex >= 0) {
			newQuantity = this.cart.items[cartProductIndex].quantity + 1;
			updatedCartItems[cartProductIndex].quantity = newQuantity;
		} else {
			updatedCartItems.push({ productId: product._id, quantity: newQuantity });
		}
		const updatedCart = { items: updatedCartItems };
		const db = getDb();
		return db.collection("users").updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
	}

	getCart() {
		const db = getDb();
		const productIds = this.cart.items.map(item => item.productId);
		return db
			.collection("products")
			.find({ _id: { $in: productIds } })
			.toArray()
			.then(products => {
				return products.map(product => {
					return {
						...product,
						quantity: this.cart.items.find(
							item => item.productId.toString() === product._id.toString()
						).quantity
					};
				});
			})
			.catch(e => console.log(e));
	}

	deleteCartItem(id) {
		const updatedCartItems = this.cart.items.filter(
			item => item.productId.toString() !== id.toString()
		);
		const db = getDb();
		return db
			.collection("users")
			.updateOne({ _id: this._id }, { $set: { cart: { items: updatedCartItems } } });
	}

	addOrder() {
		const db = getDb();
		return this.getCart()
			.then(products => {
				const order = {
					items: products,
					user: {
						_id: this._id,
						name: this.username
					}
				};
				return db.collection("orders").insertOne(order);
			})
			.then(() => {
				this.cart = { items: [] };
				return db
					.collection("users")
					.updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
			})
			.catch(e => console.log(e));
	}

	getOrders() {
		const db = getDb();
		return db
			.collection("orders")
			.find({ "user._id": this._id })
			.toArray()
			.then(orders => {
				return orders;
			})
			.catch(e => console.log(e));
	}

	static findById(id) {
		const db = getDb();
		return db
			.collection("users")
			.find({ _id: new mongodb.ObjectId(id) })
			.next()
			.then(user => {
				return user;
			})
			.catch(e => console.log(e));
	}
}

module.exports = User;
