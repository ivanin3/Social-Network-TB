require("dotenv").config();
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isauthenticated");
const prisma = require("../prisma/seed");
const upload = require("../config/multer");
const handleUpload = require("../middleware/handleUpload");

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Routes for posts
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Render the all posts page
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: All posts page rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", isAuthenticated, async (req, res) => {
  const allPost = await prisma.post.findMany({
    include: {
      author: true,
    },
  });

  res.render("home", { title: "Latest Posts", post: allPost });
});

/**
 * @swagger
 * /posts/profile:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               photo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 *     parameters:
 *       - in: body
 *         name: post
 *         description: The post object
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             photo:
 *               type: string
 */
router.post("/profile", upload.single("photo"), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const cldRes = await handleUpload(dataURI);

    await prisma.post.create({
      data: {
        content: req.body.content,
        photo: cldRes.secure_url,
        authorUserName: req.user.userName,
      },
    });
    res.redirect("/posts/profile");
  } catch (error) {
    console.log(error);
    res.redirect("/posts/profile");
  }
});

/**
 * @swagger
 * /posts/profile/user/{authorId}:
 *   get:
 *     summary: Render to your profile page or another user's profile page based on the post you select
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the author whose profile you want to view
 *     responses:
 *       200:
 *         description: Profile page rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/profile/user/:authorId", async (req, res) => {
  const { authorId } = req.params;
  const isOwnProfile = req.user && req.user.userId === authorId;
  const profileView = await prisma.user.findUnique({
    where: {
      userId: authorId,
    },
    include: {
      posts: true,
    },
  });

  const destinationView = isOwnProfile ? "profile" : "profile-page";

  res.render(destinationView, {
    profile: profileView,
    user: req.user,
    post: profileView.posts,
  });
});

/**
 * @swagger
 * /posts/profile/{id}:
 *   get:
 *     summary: Render to your post page for updated or delete
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: the ID of the post
 *     responses:
 *       200:
 *         description: Your post page rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  const updatedPost = await prisma.post.findUnique({
    where: {
      id,
    },
  });
  res.render("idpost", {
    title: updatedPost?.authorUserName,
    post: updatedPost,
  });
});

/**
 * @swagger
 * /posts/profile/update/{id}:
 *   put:
 *     summary: Update your post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the post to be updated
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               photo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.put("/profile/update/:id", upload.single("photo"), async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.content) {
      await prisma.post.update({
        where: {
         // authorUserName: req.user.userName,
          id,
        },
        data: {
          content: req.body.content,
        },
      });
    }
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const cldRes = await handleUpload(dataURI);

      await prisma.post.update({
        where: {
          authorUserName: req.user.userName,
          id,
        },
        data: {
          photo: cldRes.secure_url,
        },
      });
    }

    res.redirect("/posts/profile");
  } catch (error) {
    console.log(error);
    res.redirect("/posts");
  }
});

/**
 * @swagger
 * /posts/profile/delete/{id}:
 *   delete:
 *     summary: Delete the post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to be deleted
 *     responses:
 *       200:
 *         description: The post has been successfully deleted
 *       500:
 *         description: Internal server error
 */
router.delete("/profile/delete/:id", async (req, res) => {
  const { id } = req.params;

  await prisma.post.delete({
    where: {
      id,
    },
  });
  res.redirect("/posts/profile");
});

/**
 * @swagger
 * /posts/profile/update/{id}:
 *   get:
 *     summary: Render to your page to update the post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: the ID of the post
 *     responses:
 *       200:
 *         description: Your page to update the post rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/profile/update/:id", async (req, res) => {
  const { id } = req.params;

  const findPost = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  res.render("updateid", { title: findPost?.authorUserName, post: findPost });
});

module.exports = router;
