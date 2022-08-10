exports.notFound = (req, res, next) => {
	res
		.status(404)
		.render("404", {
			pageTitle: "Page not found",
			path: false,
			isAuthenticated: req.session.isLoggedIn
		});
};

exports.internalServerError = (req, res, next) => {
	res
		.status(500)
		.render("500", {
			pageTitle: "Internal server error",
			path: false,
			isAuthenticated: req.session.isLoggedIn
		});
};
