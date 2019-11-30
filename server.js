const express = require('express');
const expressGraphql = require('express-graphql');

const app = express();
const PORT = process.env.PORT || 3770;

app.use(express.static('dist'));

const db = {
  customers: require('./data/customers.json'),
  orders: require('./data/orders.json')
};

const schema = require('./graphql/schema');

app.use('/graphql', expressGraphql({
  schema: schema,
  graphiql: true,
  context: { db }
}));

app.listen(PORT, () => {
  console.log(`GraphQL API server running on port ${PORT}`);
});
