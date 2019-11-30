const express = require('express');
const expressGraphql = require('express-graphql');
const PORT = process.env.PORT || 3770;

const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLID, GraphQLNonNull } = require('graphql');

const db = {
  customers: require('./data/customers.json')
};

const OrderType = new GraphQLObjectType({
  name: 'Order',
  fields: {
    orderItem: { type: GraphQLString }
  }
});

const CustomerType = new GraphQLObjectType({
  name: 'Customer',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    gender: { type: GraphQLString },
    address: { type: GraphQLString },
    city: { type: GraphQLString },
    orderTotal: { type: GraphQLInt },
    orders: { type: new GraphQLList(OrderType) }
  }
});

const schema = new GraphQLSchema({
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      addAttendee: {
        description: 'Add an order to the customer',
        type: CustomerType,
        args: {
          customerID: { type: new GraphQLNonNull(GraphQLID) },
          orderItem: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve(_, { customerID, orderItem }, { db }) {
          const c = db.customers.find(c => c.id === customerID);

          if (!c) {
            return null;
          }

          if (c.orders.find(a => a.orderItem.toLowerCase() === orderItem.toLowerCase())) {
            throw new Error(`"${orderItem}" is already exist in orders`);
          }

          c.orders.push({ orderItem });

          return c;
        },
      },
    },
  }),
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      customers: {
        type: new GraphQLList(Conference),
        description: 'List all customers',
        args: {},
        resolve(_, {}, { db }) {
          db.query('selecte * ');
          return db.customers;
        },
      },
      customer: {
        type: CustomerType,
        description: 'Get a customer by ID',
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'ID of the customer',
          },
        },
        resolve(_, { id }, { db }) {
          return db.customers.find(b => b.id === id);
        },
      },
    },
  })
});

const app = express();

app.use(function(req, res, next) {
  res.on('finish', () => {
    db.save();
  });
  next();
});

app.use(express.static('dist'));

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
  context: { db },
}));

app.listen(PORT, () => console.log(`Running a GraphQL API server at http://localhost:${PORT}/graphql`));
