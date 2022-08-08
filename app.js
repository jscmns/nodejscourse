const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const errorController = require("./controllers/error");
const app = express();
const password = encodeURIComponent("iP32Le26WjaQe7rw");
const uri = `mongodb+srv://admin:${password}@cluster0.fnumx.mongodb.net/shop?retryWrites=true&w=majority`;
const store = new MongoDBStore({ uri, collection: "sessions" });
const csrfProtection = csrf();
const flash = require("connect-flash");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store }));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			req.user = user;
			next();
		})
		.catch(err => console.log(err));
});

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.notFound);

mongoose
	.connect(uri)
	.then(() => {
		app.listen(3000);
	})
	.catch(err => console.log(err));
