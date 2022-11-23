const router = require('express').Router();
const auth = require('../controller/auth.controller');
const category = require('../controller/category.controller');
const tag = require('../controller/tag.controller');
const post = require("../controller/post.controller");
const user = require("../controller/user.controller");
const access = require("../controller/access.controller");

// Auth Routes
router.post("/auth/register", auth.registerUser);
router.post("/auth/login", auth.loginUser);
router.post("/auth/admin/login", auth.adminLogin);
router.delete("/auth/logout", auth.logout);

// Category Routes
router.post("/category/add", category.createCategory);
router.get("/category/view-all", category.viewAll);
router.get("/category/:slug", category.getOne);
router.put("/category/:slug", category.updateCategory);
router.delete("/category/:slug", category.deleteCategory);

// Tag Routes
router.post("/tag/add", tag.createTag);
router.get("/tag/view-all", tag.viewAll);
router.get("/tag/:slug", tag.getOne);
router.put("/tag/:slug", tag.updateTag);
router.delete("/tag/:slug", tag.deleteTag);

// Post Routes
router.get("/post/view-all", post.getAllPost);
router.post("/post/add", post.createPost);
router.get("/post/:id", post.getPostById);
router.delete("/post/:id", post.deletePostById);
router.put("/post/:id", post.updatePost);
router.get("/post/category/:slug", post.getPostByCategory);
router.get("/post/tag/:slug", post.getPostByTag);
router.get("/post/author/view-all", post.getPostByAuthor);

// User Routes
router.get("/user/profile", user.getProfile);
router.get("/user/access", user.getAccess);
router.put("/user/profile", user.updateProfile);

// Access Routes
router.post("/access/add", access.addAccessLevel);
router.get("/access/view-all", access.getAll);
router.post("/access/:name", access.deleteAccess);
router.put("/access/update/user", access.updateUserAccess);
router.put("/access/:name", access.updateAccess);

module.exports = router;