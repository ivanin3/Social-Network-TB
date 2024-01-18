require("dotenv").config();
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isauthenticated");
const prisma = require("../prisma/seed");
const upload = require("../config/multer");
const handleUpload = require("../middleware/handleUpload");

router.get("/", isAuthenticated, async (req, res) => {
  const allPost = await prisma.post.findMany({
    include: {
      author: true,
    },
  });

  res.render("home", { title: "Latest Posts", post: allPost });
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
  });
  console.log("Profile data:", profileView);
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

module.exports = router;
