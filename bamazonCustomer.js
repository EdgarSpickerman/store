require("console.table");
const inquire = require("inquirer");

const conn = require("mysql").createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bamazon_db"
});

const questions = {
  order: [{
    type: "prompt",
    name: "id",
    message: "Please select which product id you would like to purchase",
    validate: (choice) => {
      if(Number.isInteger(parseInt(choice))) return true;
      return "Please enter a valid item_id."
    }
  },{
    type: "prompt",
    name: "qty",
    message: "Please select how many of these products you would like to purchase",
    validate: (choice) => {
      if(Number.isInteger(parseInt(choice))) return true;
      return "Please enter a valid quantity."
    }
  }]
}

const getCatalog = () => {
  const statement = `select * from products where stock_quantity > 0`;
  return new Promise((resolve, reject) => {
    conn.query(statement, (err, res) => err ? reject(err) : resolve(res))
  })
}

conn.connect()
getCatalog()
  .then(catalog => console.table(catalog))
  .then(()=>inquire.prompt(questions.order))
  .then(order=>console.log(order))
  .then(() => conn.end())
  .catch(err => console.log(err))