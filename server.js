const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/two_table"
);

const Team = sequelize.define("team", {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

const Player = sequelize.define("player", {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

const start = async () => {
  try {
    console.log("initiating");
    await sequelize.sync({ force: true });
    const Yankees = await Team.create({ name: "Yankees" });
    const Mets = await Team.create({ name: "Mets" });
    const Nets = await Team.create({ name: "Nets" });
    const Knicks = await Team.create({ name: "Knicks" });
    await Player.create({ name: "Julius Randle" });
    await Player.create({ name: "Aaron Judge" });
    await Player.create({ name: "Francisco Lindor" });
    await Player.create({ name: "Kevin Durant" });
    await Player.create({ name: "Gerrit Cole" });
    await Player.create({ name: "Mitchell Robinson" });
    await Player.create({ name: "Max Sxherzer" });
    await Player.create({ name: "Kyrie Irving" });
  } catch (ex) {
    console.log(ex);
  }
};

start();
