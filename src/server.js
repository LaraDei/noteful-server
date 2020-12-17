const knex = require('knex')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')

const db = knex ({
  client: 'pg',
  connection: {
    host : '5432',
    user: dunder_mifflin,
    database : 'noteful',
    ssl: true
  }
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})