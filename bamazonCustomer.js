require("console.table");
const inquire = require("inquirer");

const conn = require("mysql").createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bamazon_db"
});

const validNumer = (choice, message) => {
  if (Number.isInteger(parseInt(choice))) return true;
  return message
}

const questions = {
  order: [{
    type: "prompt",
    name: "id",
    message: "Please select which product id you would like to purchase",
    validate: (choice) => validNumer(choice, "Please enter a valid item_id.")
  }, {
    type: "prompt",
    name: "qty",
    message: "Please select how many of these products you would like to purchase",
    validate: (choice) => validNumer(choice, "Please enter a valid quantity.")
  }]
}


const getCatalog = () => {
  const statement = `select * from products where stock_quantity > 0`;
  return new Promise((resolve, reject) => {
    conn.query(statement, (err, res) => err ? reject(err) : resolve(res))
  })
}

const checkOrder = (order) => {
  const statement = `select * from products where item_id = ${order.id} and stock_quantity >= ${order.qty}`;
  return new Promise((resolve, reject) => {
    conn.query(statement, (err, res) =>
      err ? reject(err) : resolve({ items: res, order: order }))
  })
}

const updateDB = (stock, order) => {
  const statement = `update products set stock_quantity = ${stock - order.qty} where item_id = ${order.id}`;
  return new Promise((resolve, reject) => {
    conn.query(statement, (err, res) => err ? reject(err) : resolve())
  })
}

const calcPrice = (results) => {
  const price = (results.items[0].price * results.order.qty).toFixed(2)
  return `Your purchase price is $${price}`
}

const retrieveMessage = (results) => {
  const stock = results.items[0].stock_quantity
  if (results.items.length) {
    return updateDB(stock,results.order).then(() => calcPrice(results))
  }
  return "Insufficient quantity!";
}

const processOrder = (order) =>
  checkOrder(order).then(results => retrieveMessage(results))

conn.connect()
getCatalog()
  .then(catalog => console.table(catalog))
  .then(() => inquire.prompt(questions.order))
  .then(order => processOrder(order))
  .then(status => console.log(status))
  .then(() => conn.end())
  .catch(err => console.log(err))