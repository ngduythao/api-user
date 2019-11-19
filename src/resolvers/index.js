const { User } = require("../models");

const resolvers = {
  Query: {
    getUsers: async () => await User.find({}).exec(),
    getUser: async (_, args) => await User.findOne(args).exec()
  },
  Mutation: {
    addUser: async (_, args) => {
      try {
        let response = await User.create(args);
        return response;
      } catch (e) {
        return e.message;
      }
    }
  }
};

module.exports = resolvers;
