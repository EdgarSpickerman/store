require("console.table");

const conn = require("mysql").createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bamazon_db"
});

const getCatalog = () => {
  const statement = `select * from products where stock_quantity > 0`;
  return new Promise((resolve, reject) => {
    conn.query(statement, (err, res) => err ? reject(err) : resolve(res))
  })
}

conn.connect()
getCatalog()
  .then(catalog => console.table(catalog))
  .then(()=>conn.end())
  .catch(err=>console.log(err))