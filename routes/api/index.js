const router = require('express').Router();
const thoughtsRoute = require('./thoughts-route');
const userRoute = require('./users-route');

router.use('/thoughts', thoughtsRoute);
router.use('/user', userRoute);

module.exports = router;