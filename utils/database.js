const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;
const password = encodeURIComponent("iP32Le26WjaQe7rw");
const uri = `mongodb+srv://admin:${password}@cluster0.fnumx.mongodb.net/shop?retryWrites=true&w=majority`;

let _db;

const mongoConnect = callback => {
	MongoClient.connect(uri)
		.then(client => {
			_db = client.db();
			callback(client);
		})
		.catch(e => {
			throw e;
		});
};

const getDb = () => {
	if (_db) return _db;
	throw "No database found. Please connect to a database first.";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
