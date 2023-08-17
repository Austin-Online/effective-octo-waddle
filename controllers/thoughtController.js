const {User,Thought} = require('../models');

const thoughtController = {
  // GET all thoughts
  async getAllThoughts(req, res) {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching thoughts' });
    }
  },

  // GET a single thought by its _id
  async getThoughtById(req, res) {
    const { id } = req.params;
    try {
      const thought = await Thought.findById(id);
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
      res.json(thought);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching the thought' });
    }
  },

  // POST to create a new thought
  async createThought(req, res) {
    const { thoughtText, username, userId } = req.body;
  
    try {
      const newThought = new Thought({
        thoughtText,
        username,
      });
  
      const savedThought = await newThought.save();
  
      // Push the created thought's _id to the associated user's thoughts array field
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.thoughts.push(savedThought._id);
      await user.save();
  
      res.status(201).json(savedThought);
    } catch (err) {
      res.status(500).json({ message: 'Error creating the thought', error: err.message });
    }
  },

  // PUT to update a thought by its _id
  async updateThought(req, res) {
    const { id } = req.params;
    const { thoughtText } = req.body;

    try {
      const updatedThought = await Thought.findByIdAndUpdate(
        id,
        { thoughtText },
        { new: true }
      );

      if (!updatedThought) {
        return res.status(404).json({ message: 'Thought not found' });
      }

      res.json(updatedThought);
    } catch (err) {
      res.status(500).json({ message: 'Error updating the thought' });
    }
  },


// DELETE to remove a thought by its _id
async deleteThought(req, res) {
  const { id } = req.params;

  try {
    const deletedThought = await Thought.findByIdAndDelete(id);

    if (!deletedThought) {
      return res.status(404).json({ message: 'Thought not found' });
    }

    //Remove the thought's _id from the associated user's thoughts array field
    const user = await User.findOne({ username: deletedThought.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.thoughts.indexOf(id);
    if (index !== -1) {
      user.thoughts.splice(index, 1);
      await user.save();
    }

    res.json(deletedThought);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting the thought' });
  }
},
  
  // POST to create a reaction stored in a single thought's reactions array field
  async createReaction(req, res) {
    const { thoughtId } = req.params;
    const { reactionText, username } = req.body;

    try {
      const thought = await Thought.findById(thoughtId);

      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }

      const newReaction = {
        reactionText,
        username,
      };

      thought.reactions.push(newReaction);
      await thought.save();

      res.status(201).json(thought);
    } catch (err) {
      res.status(500).json({ message: 'Error creating the reaction' });
    }
  },

  // DELETE to pull and remove a reaction by the reaction's reactionId value
  async deleteReaction(req, res) {
    const { thoughtId, reactionId } = req.params;

    try {
      const thought = await Thought.findById(thoughtId);

      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }

      // Find the index of the reaction with the given reactionId
      const reactionIndex = thought.reactions.findIndex(
        (reaction) => reaction._id.toString() === reactionId
      );

      if (reactionIndex === -1) {
        return res.status(404).json({ message: 'Reaction not found' });
      }

      // Remove the reaction from the array using the splice method
      thought.reactions.splice(reactionIndex, 1);

      await thought.save();

      res.json(thought);
    } catch (err) {
      res.status(500).json({ message: 'Error deleting the reaction' });
    }
  },
};

module.exports = thoughtController;