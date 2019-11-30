(async function() {

  // GraphQL query
  const query = `{
    customers {
      id
      firstName
      lastName
      gender
      address
      city
      orderTotal
      orders {
        orderItems {
          id
          productName
          itemCost
        }
      }
    }
  }`;

  // Send the request
  const { data } = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  }).then(res => res.json());

  // Get reference to <ul> element
  const element = document.querySelector('#customers');

  // Create list item for each customer
  for (const c of data.customers) {
    const li = document.createElement('li');
    li.innerText = `${c.firstName} (${c.orders.length} orders)`;
    element.appendChild(li);
  }

})();
