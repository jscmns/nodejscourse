const express = require("express");
const path = require("path");
const adminController = require("../controllers/admin");
const router = express.Router();

router.get("/add-product", adminController.getAddProductPage);

router.get("/products", adminController.getProducts);

router.post("/add-product", adminController.postProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product/:productId', adminController.deleteProduct);

module.exports = router;
