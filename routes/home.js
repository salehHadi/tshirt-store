const express = require('express');
const router = express.Router();

const { home, hometest } = require('../controllers/homeController');

router.route('/').get( home );
router.route('/test').get( hometest );

module.exports = router;