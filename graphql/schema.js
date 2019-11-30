const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLID, GraphQLNonNull } = require('graphql');

const OrderItems = new GraphQLObjectType({
  name: 'OrderItems',
  fields: {
    id: { type: GraphQLID },
    productName: { type: GraphQLString },
    itemCost: { type: GraphQLFloat }
  }
});

const Order = new GraphQLObjectType({
  name: 'Order',
  fields: {
    customerId: { type: GraphQLID },
    orderItems: { type: new GraphQLList(OrderItems) }
  }
});

const Customer = new GraphQLObjectType({
  name: 'Customer',
  fields: {
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    gender: { type: GraphQLString },
    address: { type: GraphQLString },
    city: { type: GraphQLString },
    orderTotal: { type: GraphQLFloat },
    orders: { type: new GraphQLList(Order) }
  }
});

const schema = new GraphQLSchema({
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      addOrder: {
        description: 'Add an order to the customer',
        type: Order,
        args: {
          customerID: { type: new GraphQLNonNull(GraphQLID) },
          orderItems: { type: new GraphQLList(GraphQLString) }
        },
        resolve(_, { customerID, orderItems }, { db }) {
          const c = db.customers.find(c => c.id === customerID);

          if (!c) {
            return null;
          }

          if (c.orders.find(a => a.orderItems.toLowerCase() === orderItems.productName.toLowerCase())) {
            throw new Error(`"${orderItems}" is already exist in orders`);
          }

          c.orders.push({ orderItems });

          return c;
        }
      }
    }
  }),
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      customers: {
        type: new GraphQLList(Customer),
        description: 'Get all customers',
        args: {},
        resolve(_, {}, { db }) {
          const c = db.customers.map(c => {
            const o = db.orders.filter(o => o.customerId === c.id);
            if(o && o[0] && o[0].orderItems) {
              c.orders = o[0].orderItems || [];
            } else {
              c.orders = [];
            }
            return c;
          });
          return c;
        }
      },
      customer: {
        type: Customer,
        description: 'Get a customer by id',
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the customer'
          }
        },
        resolve(_, { id }, { db }) {
          return db.customers.find(c => c.id === id);
        },
      },
      orders: {
        type: new GraphQLList(Order),
        description: 'Get all orders for a customer by customer id',
        args: {
          customerId: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'Id of the customer'
          }
        },
        resolve(_, {}, { db }) {
          return db.orders.find(o => o.customerId === customerId);
        }
      }
    }
  })
});

module.exports = schema;
