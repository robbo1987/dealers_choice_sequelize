const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/two_table"
);
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const { AsyncQueueError } = require("sequelize");
const port = process.env.PORT || 3000;

const Team = sequelize.define("team", {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
});

const Player = sequelize.define("player", {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
});

Player.belongsTo(Team);
Team.hasMany(Player);

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("remove"));

app.get("/", (req, res) => {
  res.redirect("/players");
});

app.delete("players/:id", async (req, res, next) => {
  try {
    const player = await Player.findByPk(req.params.id);
    await player.destroy();
    res.redirect(`/teams/${player.teamId}`);
  } catch {
    next(ex);
  }
});

app.post("/players", async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    res.redirect(`/teams/${player.teamId}`);
    res.send(req.body);
  } catch (ex) {
    next(ex);
  }
});
app.get("/players", async (req, res, next) => {
  try {
    const players = await Player.findAll({ include: [Team] });
    const teams = await Team.findAll();

    const options = teams
      .map((team) => {
        return `<option value ='${team.id}'>${team.name}</option>`;
      })
      .join("");

    const html = players
      .map((player) => {
        return `<div>
            ${player.name} 
            <a href='/teams/${player.teamId}'> ${player.team.name} </a>
            </div>
            
    `;
      })
      .join("");

    res.send(`
  <html>
    <style>
      body{
        background-color:aquamarine
      }
      h1{
        font-family:verdana;
        color:red;
        text-align:center;
      }
      div{
        display:flex;
        flex-direction:row;
        justify-content:space-around;
        border: black solid 2px;
        width: 75%;
        margin-left:150px;}

      form{
        
        text-align:center;

      }

      input{

        width:33%;
      }
     
    </style>
    <head>
    <title>NEW YORK SPORTS PAGE</title>
    </head> 
      <body>
        <h1> NEW YORK SPORTS PAGE </h1>
        <form method= 'POST'>
          <input name= 'name' placeholder= 'INSERT PLAYER NAME'/>
          <select name='teamId'> ${options} </select>
          <button> ADD PLAYER </button>
        </form>
        ${html}
      </body>
  </html>
  
  `);
  } catch (ex) {
    next(ex);
  }
});

app.get("/teams/:id", async (req, res, next) => {
  try {
    const teams = await Team.findByPk(req.params.id, { include: [Player] });
    const html = teams.players
      .map((player) => {
        return `
      <div>
        ${player.name}
        <form method='POST' action='/players/${player.id}?remove=delete'>
          <button>DELETE</button>
        </form>
      </div>
      `;
      })
      .join("");
    res.send(`
    <html>
    <style>
      body{
        background-color:aquamarine
      }
      h1{
        font-family:verdana;
        color:red;
        text-align:center;
      }
      h2{
        font-family:verdana;
        color:black;
        text-align:center;
      }
      .center{
        text-align:center;
      }
     
    </style>
    <head>
    <title>NEW YORK SPORTS PAGE</title>
    </head> 
      <body>
        <h1> NEW YORK SPORTS PAGE </h1>
        <h2>${teams.name}<h2>
        <h2>${html}</h2>
        <div class = "center">
        <a href = '/players'> **BACK** </a>
        </div>
        </body>
  </html>
    
    `);
  } catch (ex) {
    next(ex);
  }
});

const start = async () => {
  try {
    console.log("initiating");
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
    await sequelize.sync({ force: true });
    const Yankees = await Team.create({ name: "Yankees" });
    const Mets = await Team.create({ name: "Mets" });
    const Nets = await Team.create({ name: "Nets" });
    const Knicks = await Team.create({ name: "Knicks" });
    await Player.create({ name: "Julius Randle", teamId: Knicks.id });
    await Player.create({ name: "Aaron Judge", teamId: Yankees.id });
    await Player.create({ name: "Francisco Lindor", teamId: Mets.id });
    await Player.create({ name: "Kevin Durant", teamId: Nets.id });
    await Player.create({ name: "Gerrit Cole", teamId: Yankees.id });
    await Player.create({ name: "Mitchell Robinson", teamId: Knicks.id });
    await Player.create({ name: "Max Scherzer", teamId: Mets.id });
    await Player.create({ name: "Kyrie Irving", teamId: Nets.id });
    await Player.create({ name: "Ben Simmons", teamId: Nets.id });
  } catch (ex) {
    console.log(ex);
  }
};

start();
