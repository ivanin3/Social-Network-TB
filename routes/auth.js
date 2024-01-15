const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma/seed");
const transporter = require("../config/nodemailer");

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Sign Up" });
});

// Ruta de registro
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        userName: req.body.username,
        password: hashedPassword,
      },
    });

    let mailOptions = {
      from: {
        name: "TB-social-network",
        address: process.env.EMAIL,
      },
      to: req.body.email,
      subject: "Welcome to TB-Social Network",
      text: `Welcome ${newUser.userName}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Correo enviado: " + info.response);
      }
    });

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
});

// Ruta de inicio de sesión
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

module.exports = router;
