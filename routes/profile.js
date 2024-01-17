require("dotenv").config();
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isauthenticated");
const prisma = require("../prisma/seed");
const upload = require("../config/multer");
const handleUpload = require("../middleware/handleUpload");

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

  router.put("/profile", upload.single("photo"), async (req, res) => {
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
  });

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