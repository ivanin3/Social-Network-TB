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
 *   name: Profile
 *   description: Routes for Profile
 */

/**
 * @swagger
 * /posts/profile:
 *   get:
 *     summary: Render your profile page
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Your profile page rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/profile", isAuthenticated, async (req, res) => {
    const profilePosts = await prisma.post.findMany({
      where: {
        authorUserName: req.user.userName,
      },
    });
    res.render("profile", {
      title: "My profile",
      user: req.user,
      post: profilePosts,
    });
  });

  /**
 * @swagger
 * /posts/profile:
 *   put:
 *     summary: Create a new post
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               photo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 *     parameters:
 *       - in: body
 *         name: profile
 *         description: The profile object
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             photo:
 *               type: string
 */
 /* router.put("/profile", upload.single("photo"), async (req, res) => {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  
      const cldRes = await handleUpload(dataURI);
  
      const userUpdated = await prisma.user.update({
        where: {
          userId: req.user.userId,
        },
        data: {
          userName: req.body.userName,
          email: req.body.email,
          photo: cldRes.secure_url,
        },
      });
  
      res.redirect("/profile");
    } catch (error) {
      console.log(error);
      res.redirect("/profile");
    }
  });*/

/**
 * @swagger
 * /posts/profile/edit/{userId}:
 *   get:
 *     summary: Render to your page to edit your profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Profile edit page rendered successfully
 *       500:
 *         description: Internal server error
 */
  router.get("/profile/edit/:userId", async (req, res) => {
    const { userId } = req.params;
    const editProfile = await prisma.user.findUnique({
        where: {
            userId,
          
        },
    });
    res.render("editprofile", {
        title: editProfile?.userName,
        user: editProfile,
    });
});

router.put("/profile/edit/:userId", upload.single("photo"), async (req, res) => {
    const { userId } = req.params;
  
    try {
  
      if (req.body.userName) {
  
        await prisma.user.update({
          where: {
            userId,
          },
          data: {
            userName: req.body.userName,
          },
        });
      }
      if (req.file) {
  
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  
        const cldRes = await handleUpload(dataURI);
  
        await prisma.user.update({
          where: {
            userId,
          },
          data: {
            photo: cldRes.secure_url,
          },
        });
      }
  
      res.redirect('/posts/profile');
    } catch (error) {
      console.log(error);
      res.redirect('/posts');
    }
  });

  module.exports = router;