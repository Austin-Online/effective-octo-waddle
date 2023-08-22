const { User, Thought } = require('../models');

const thoughtsController = {
  async handleErrorResponse(res, message) {
    res.status(500).json({ message });
  },

  async handleNotFoundResponse(res, item) {
    res.status(404).json({ message: `${item} not found` });
  },

  async getAllThoughts(req, res) {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      thoughtsController.handleErrorResponse(res, 'Error fetching thoughts');
    }
  },

  async getThoughtById(req, res) {
    const { id } = req.params;
    try {
      const thought = await Thought.findById(id);
      if (!thought) {
        thoughtsController.handleNotFoundResponse(res, 'Thought');
      } else {
        res.json(thought);
      }
    } catch (err) {
      thoughtsController.handleErrorResponse(res, 'Error fetching the thought');
    }
  },

  async createThought(req, res) {
    const { thoughtText, username, userId } = req.body;

    try {
      const newThought = new Thought({
        thoughtText,
        username,
      });

      const savedThought = await newThought.save();

      const user = await User.findById(userId);
      if (!user) {
        return thoughtsController.handleNotFoundResponse(res, 'User');
      }

      user.thoughts.push(savedThought._id);
      await user.save();

      res.status(201).json(savedThought);
    } catch (err) {
      thoughtsController.handleErrorResponse(res, `Error creating the thought: ${err.message}`);
    }
  },

  async updateThought(req, res) {
    const { id } = req.params;
    const { thoughtText } = req.body;

    try {
      const updatedThought = await Thought.findByIdAndUpdate(id, { thoughtText }, { new: true });

      if (!updatedThought) {
        thoughtsController.handleNotFoundResponse(res, 'Thought');
      } else {
        res.json(updatedThought);
      }
    } catch (err) {
      thoughtsController.handleErrorResponse(res, 'Error updating the thought');
    }
  },

  async deleteThought(req, res) {
    const { id } = req.params;

    try {
      const deletedThought = await Thought.findByIdAndDelete(id);

      if (!deletedThought) {
        thoughtsController.handleNotFoundResponse(res, 'Thought');
      } else {
        const user = await User.findOne({ username: deletedThought.username });

        if (user) {
          const index = user.thoughts.indexOf(id);
          if (index !== -1) {
            user.thoughts.splice(index, 1);
            await user.save();
          }
        }

        res.json(deletedThought);
      }
    } catch (err) {
      thoughtsController.handleErrorResponse(res, 'Error deleting the thought');
    }
  },

  async createReaction(req, res) {
    const { thoughtId } = req.params;
    const { reactionText, username } = req.body;

    try {
      const thought = await Thought.findById(thoughtId);

      if (!thought) {
        thoughtsController.handleNotFoundResponse(res, 'Thought');
      } else {
        const newReaction = {
          reactionText,
          username,
        };

        thought.reactions.push(newReaction);
        await thought.save();

        res.status(201).json(thought);
      }
    } catch (err) {
      thoughtsController.handleErrorResponse(res, 'Error creating the reaction');
    }
  },

  async deleteReaction(req, res) {
    const { thoughtId, reactionId } = req.params;

    try {
      const thought = await Thought.findById(thoughtId);

      if (!thought) {
        thoughtsController.handleNotFoundResponse(res, 'Thought');
      } else {
        const reactionIndex = thought.reactions.findIndex(
          (reaction) => reaction._id.toString() === reactionId
        );

        if (reactionIndex === -1) {
          thoughtsController.handleNotFoundResponse(res, 'Reaction');
        } else {
          thought.reactions.splice(reactionIndex, 1);
          await thought.save();
          res.json(thought);
        }
      }
    } catch (err) {
      thoughtsController.handleErrorResponse(res, 'Error deleting the reaction');
    }
  },
};

module.exports = thoughtsController;