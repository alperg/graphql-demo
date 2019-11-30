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
        id
        productName
        itemCost
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
    const span = document.createElement('span');
    span.innerText = `${c.firstName} ${c.lastName} (${c.orders.length ? c.orders.length : 'No'} orders)`;
    span.setAttribute('class', 'list-item');
    span.setAttribute('data-id', c.id);
    li.appendChild(span)
    
    const ul = document.createElement('ul');
    ul.setAttribute('id', 'orders');
    for (const o of c.orders) {
      const li = document.createElement('li');
      li.innerText = `${o.productName}`;
      ul.appendChild(li);
    }
    li.appendChild(ul);
    
    element.appendChild(li);
  }

  element.addEventListener("click", function(e) {
    if (event.target.matches('[data-id]')) {
      const customerId = e.target.getAttribute('data-id');
      
      // GraphQL query
      const query = `{
        orders(customerId: ${customerId}) {
          id
          productName
          itemCost
        }
      }`;

      // Send the request
      fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data.data.orders);
        // Get reference to <ul> element
        const element = document.querySelector('#details');
        element.style.display = 'block';
        // Delete all nodes
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
        if(data.data.orders.length > 0) {
          // Create list item for each order
          for (const o of data.data.orders) {
            const li = document.createElement('li');
            li.innerHTML = `<b>Product:</b> ${o.productName}, <b>Cost:</b> ${o.itemCost}`;
            element.appendChild(li);
          }
        } else {
          const h3 = document.createElement('h3');
          h3.innerText = 'No orders for this customer';
          element.appendChild(h3);
        }
      });
    }
  });
})();
