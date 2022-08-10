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
const multer = require("multer");

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString().replace(/\-/g, '').replace(/\:/g, '') + "-" + file.originalname);
	}
});
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store }));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			if (!user) return next();
			req.user = user;
			next();
		})
		.catch(err => {
			throw new Error(err);
		});
});

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.internalServerError);

app.use(errorController.notFound);

app.use((error, req, res, next) => {
	console.log(error);
	res.redirect("/500");
});

mongoose
	.connect(uri)
	.then(() => {
		app.listen(3000);
	})
	.catch(err => console.log(err));
