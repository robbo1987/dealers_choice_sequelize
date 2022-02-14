const Sequelize = require('sequelize')
const sequelize = new Sequelize( process.env.DATABASE_URL || 'postgres://localhost/two_table' )



const start = async (req,res,next) => {
   try{ 
    console.log('hello world');
   }

   catch(ex){
    next(ex)

   }
}

start()


