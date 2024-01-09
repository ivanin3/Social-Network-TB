const express = require('express');
const router = express.Router();


router.use('/posts', require('./post'));
router.use('/', require ('./auth'));

router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home Page'
    });
  });

module.exports = router;