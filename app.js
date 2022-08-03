const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const { mongoConnect } = require("./utils/database");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
	User.findById("62eab65780b0edfc041449c0")
		.then(user => {
			req.user = new User(user.username, user.email, user._id, user.cart);
			next();
		})
		.catch(e => console.log(e));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.notFound);

mongoConnect(() => {
	app.listen(3000);
});
