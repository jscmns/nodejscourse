const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	resetToken: String,
	resetTokenExpiration: Date,
	cart: {
		items: [
			{
				productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
				quantity: { type: Number, required: true }
			}
		]
	}
});

userSchema.methods.addToCart = function (product) {
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
	this.cart = updatedCart;
	return this.save();
};

userSchema.methods.removeFromCart = function (id) {
	const updatedCart = this.cart.items.filter(item => {
		return item.productId.toString() !== id.toString();
	});
	this.cart = updatedCart;
	return this.save();
};

userSchema.methods.clearCart = function () {
	this.cart = { items: [] };
	return this.save();
};

module.exports = mongoose.model("User", userSchema);