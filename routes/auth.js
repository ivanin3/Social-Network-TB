const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma/seed");
const transporter = require("../config/nodemailer");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Render the login page
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login page rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});
/**
 * @swagger
 * /register:
 *   get:
 *     summary: Render the register page
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Register page rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/register", (req, res) => {
  res.render("register", { title: "Sign Up" });
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user object
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             username:
 *               type: string
 *             password:
 *               type: string
 */
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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user credentials
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

/**
 * @swagger
 * /profile/logout:
 *   get:
 *     summary: logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: logout rendered successfully
 *       500:
 *         description: Internal server error
 */
router.get("/profile/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
