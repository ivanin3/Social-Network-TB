const express = require('express');
const router = express.Router();


router.use('/posts', require('./post'));
router.use('/', require ('./auth'));
router.use('/posts', require('./profile'));

router.get('/', (req, res) => {
    res.render('initial');
  });

module.exports = router;