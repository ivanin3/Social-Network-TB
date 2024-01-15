require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const isAuthenticated = require("../middleware/isauthenticated");
const passport = require("passport");
const prisma = require("../prisma/seed");
const upload = require("../config/multer");
const handleUpload = require("../middleware/handleUpload");

router.get("/", isAuthenticated, async (req, res) => {
  const allPost = await prisma.post.findMany({});

  res.render("home", { title: "post", post: allPost });
});

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

router.put("/profile/update/:id", upload.single("photo"), async (req, res) => {
    const { id } = req.params;
  
    try {

      if (req.body.content) {

        await prisma.post.update({
          where: {
            authorUserName: req.user.userName,
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

router.delete("/profile/delete/:id", async (req, res) => {
  const { id } = req.params;

  await prisma.post.delete({
    where: {
      id,
    },
  });
  res.redirect("/posts/profile");
});

router.get("/profile/update/:id", async (req, res) => {
  const { id } = req.params;

  const findPost = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  res.render("updateid", { title: findPost?.authorUserName, post: findPost });
});

router.get("/profile/:userName", async (req, res) => {
  const { userName } = req.params;
  const profileView = prisma.user.findUnique ({
    where: {
userName,
    },
  });
  res.render("profile", {
    title: "Hola",
    user: req.post.authorUserName,
    post: profileView,
  });
});

router.get("/profile/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});


module.exports = router;
