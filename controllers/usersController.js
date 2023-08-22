const { User, Thought } = require('../models');

const usersController = {
  async handleErrorResponse(res, message) {
    res.status(500).json({ message });
  },

  async handleNotFoundResponse(res, item) {
    res.status(404).json({ message: `${item} not found` });
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      usersController.handleErrorResponse(res, 'Error fetching users');
    }
  },

  async getSingleUser(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .populate('thoughts')
        .populate('friends');

      if (!user) {
        usersController.handleNotFoundResponse(res, 'User');
      } else {
        res.json(user);
      }
    } catch (error) {
      usersController.handleErrorResponse(res, 'Error fetching the user');
    }
  },

  async createUser(req, res) {
    const { username, email } = req.body;
    const user = new User({ username, email });

    try {
      await user.save();
      res.json(user);
    } catch (error) {
      usersController.handleErrorResponse(res, 'Error creating the user');
    }
  },

  async updateUser(req, res) {
    const { username, email } = req.body;

    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { username, email },
        { new: true }
      );

      if (!user) {
        usersController.handleNotFoundResponse(res, 'User');
      } else {
        res.json(user);
      }
    } catch (error) {
      usersController.handleErrorResponse(res, 'Error updating the user');
    }
  },

  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        usersController.handleNotFoundResponse(res, 'User');
      } else {
        await Thought.deleteMany({ _id: { $in: user.thoughts } });
        res.json({ message: 'User deleted successfully' });
      }
    } catch (error) {
      usersController.handleErrorResponse(res, 'Error deleting the user');
    }
  },

  async handleFriendUpdateResponse(res, user) {
    if (!user) {
      usersController.handleNotFoundResponse(res, 'User');
    } else {
      res.json(user);
    }
  },

  async addFriend(req, res) {
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { friends: friendId } },
        { new: true }
      ).populate('friends');

      usersController.handleFriendUpdateResponse(res, user);
    } catch (error) {
      usersController.handleErrorResponse(res, 'Error adding a friend');
    }
  },

  async removeFriend(req, res) {
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { friends: friendId } },
        { new: true }
      ).populate('friends');

      usersController.handleFriendUpdateResponse(res, user);
    } catch (error) {
      usersController.handleErrorResponse(res, 'Error removing a friend');
    }
  },
};

module.exports = usersController;
