const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const isAuthenticated = require("../middleware/isauthenticated");
const passport = require('passport');
const prisma = require('../prisma/seed');


router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/', isAuthenticated, async (req, res) => {
    const allPost = await prisma.post.findMany({});

    res.render('home', { title: 'post', post: allPost });
});

router.get('/profile', isAuthenticated, async (req, res) => {
    const profilePosts = await prisma.post.findMany({
        where: {
            authorUserName: req.user.userName,
        }
    });
    res.render('profile', { title: 'My profile', user: req.user, post: profilePosts })
});

router.post('/profile', async (req, res) => {
    const { content } = req.body;
    console.log(req.user);
    await prisma.post.create({
        data: {
            content,
            authorUserName: req.user.userName,
        },
    });
    res.redirect('/posts/profile');
});

router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const updatedPost = await prisma.post.findUnique({
        where: {
            id,
        },
    });
    res.render('idpost', { title: updatedPost?.authorUserName, post: updatedPost });
});

router.put('/profile/update/:id', async (req, res) => {
    const { id } = req.params;

    await prisma.post.update({
        where: {
            authorUserName: req.user.userName,
            id,
        },
        data: {
            content: req.body.content,
        },
    });
    res.redirect('/posts/profile');
});

router.delete('/profile/delete/:id', async (req, res) => {
    const { id } = req.params;

    await prisma.post.delete({
        where: {
            id,
        },
    });
    res.redirect('/posts/profile');
});

router.get('/profile/update/:id', async (req, res) => {
    const { id } = req.params;

    const findPost = await prisma.post.findUnique({
        where: {
            id,
        },
    });

    res.render('updateid', { title: findPost?.title, post: findPost})
});

router.get('/profile/delete/:id', async (req, res) => {
    const { id } = req.params;

    const findPost = await prisma.post.findUnique({
        where: {
            id,
        },
    });

    res.render('idpost', { title: findPost?.title, post: findPost})
});







module.exports = router;