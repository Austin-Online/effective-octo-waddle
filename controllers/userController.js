const {User,Thought} = require('../models');

const userController = {
  // GET all users
  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // GET a single user by its _id and populate thought and friend data
  async getSingleUser(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .populate('thoughts') // Populate the thoughts array
        .populate('friends'); // Populate the friends array

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching the user' });
    }
  },

  // POST to create a new user
  async createUser(req, res) {
    const { username, email } = req.body;
    const user = new User({ username, email });
    try {
      await user.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error creating the user' });
    }
  },

  // PUT to update a user by its _id
  async updateUser(req, res) {
    const { username, email } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { username, email },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error updating the user' });
    }
  },

  // DELETE to remove a user by its _id
  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // BONUS: Remove a user's associated thoughts when deleted
      await Thought.deleteMany({ _id: { $in: user.thoughts } });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting the user' });
    }
  },

  async addFriend(req, res) {
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    console.log('userId:', userId);//test
    console.log('friendId:', friendId);//test
  
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { friends: friendId } },
        { new: true }
      ).populate('friends');
  
      console.log('updated user:', user); // test to see the updated user object
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error(error);//test to see the updated user object
      res.status(500).json({ message: 'Error adding a friend' });
    }
  },

  // DELETE to remove a friend from a user's friend list
  async removeFriend(req, res) {
    const userId = req.params.userId;
    const friendId = req.params.friendId;


    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { friends: friendId } },
        { new: true }
      ).populate('friends');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error removing a friend' });
    }
  },
};

module.exports = userController;