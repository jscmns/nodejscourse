const { getDb } = require("../utils/database");
const mongodb = require("mongodb");

class Product {
	constructor(title, price, description, imageUrl, id, userId) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this._id = id ? new mongodb.ObjectId(id) : null;
		this.userId = userId;
	}

	saveOrUpdate() {
		const db = getDb();
		if (this._id) {
			return db
				.collection("products")
				.updateOne({ _id: this._id }, { $set: this })
				.then(res => console.log(res))
				.catch(e => console.log(e));
		}
		return db
			.collection("products")
			.insertOne(this)
			.then(res => console.log(res))
			.catch(e => console.log(e));
	}

	static fetchAll() {
		const db = getDb();
		return db
			.collection("products")
			.find()
			.toArray()
			.then(products => {
				return products;
			})
			.catch(e => console.log(e));
	}

	static findById(id) {
		const db = getDb();
		return db
			.collection("products")
			.find({ _id: new mongodb.ObjectId(id) })
			.next()
			.then(product => {
				return product;
			})
			.catch(e => console.log(e));
	}

	static delete(id) {
		const db = getDb();
		return db
			.collection("products")
			.deleteOne({ _id: new mongodb.ObjectId(id) })
			.then(res => {
				console.log(res);
			})
			.catch(e => console.log(e));
	}
}

module.exports = Product;
