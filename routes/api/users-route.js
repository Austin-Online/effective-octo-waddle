const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');

router.route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

router.route('/:id')
  .get(usersController.getSingleUser)
  .put(usersController.updateUser)
  .delete(usersController.deleteUser);

router.route('/:userId/friends/:friendId')
  .post(usersController.addFriend)
  .delete(usersController.removeFriend);

module.exports = router;
