const express = require('express');
const router = express.Router();

router.get('/', require('./lista'));

module.exports = router;
