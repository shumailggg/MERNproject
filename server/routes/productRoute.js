const express = require("express");
const {
  getAllProducts,
  creatingProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  createProductReview,
  getProductRevieews,
  deleteReview,
  getAdminProducts,
} = require("../controllers/productController.js");
const isAuthenticatedUser = require("../middleware/auth.js");
const authorizeRoles = require("../middleware/authRoles.js");

const router = express.Router();

router.route("/products").get(getAllProducts);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

router
  .route("/admin/products/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), creatingProduct);

router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getSingleProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getProductRevieews)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router;
