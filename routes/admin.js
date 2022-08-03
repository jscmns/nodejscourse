const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();

router.get("/add-product", adminController.getAdminAddProductPage);

router.get("/products", adminController.getAdminProducts);

router.post("/add-product", adminController.postProduct);

router.get('/edit-product/:id', adminController.getProductToEdit);

router.post('/edit-product', adminController.updateProduct);

router.post('/delete-product/:id', adminController.deleteProduct);

module.exports = router;
