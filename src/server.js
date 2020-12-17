const knex = require('knex')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')

const db = knex ({
  client: 'pg',
  connection: {
    host : 'ec2-34-194-198-238.compute-1.amazonaws.com',
    user: vufbbewpmyonhc,
    database : 'dbd7ubn31e0h66',
    password : 'ec97d4883f6a07f44ed844e19ab119e57fedb075c0108c291813d86a1e34ad37',
    database : 'noteful',
    ssl: true
  }
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})