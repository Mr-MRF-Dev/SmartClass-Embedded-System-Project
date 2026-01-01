require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

module.exports = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
