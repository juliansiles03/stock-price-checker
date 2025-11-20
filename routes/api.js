'use strict';

const fetch = require('node-fetch');
const mongoose = require('mongoose');
const crypto = require('crypto');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const stockSchema = new mongoose.Schema({
  stock: String,
  likes: Number,
  ip: [String]
});

const Stock = mongoose.model("Stock", stockSchema);

async function getPrice(stock) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  const res = await fetch(url);
  const data = await res.json();
  return data.latestPrice;
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        let { stock, like } = req.query;

        const userIp = crypto.createHash("sha256")
                             .update(req.ip)
                             .digest("hex");

        if (!Array.isArray(stock)) {
          stock = [stock];
        }

        let results = [];

        for (let s of stock) {
          const symbol = s.toUpperCase();
          const price = await getPrice(symbol);

          let dbStock = await Stock.findOne({ stock: symbol });

          if (!dbStock) {
            dbStock = new Stock({
              stock: symbol,
              likes: 0,
              ip: []
            });
          }

          if (like === "true" && !dbStock.ip.includes(userIp)) {
            dbStock.likes += 1;
            dbStock.ip.push(userIp);
            await dbStock.save();
          }

          results.push({
            stock: symbol,
            price,
            likes: dbStock.likes
          });
        }

        if (results.length === 1) {
          return res.json({ stockData: results[0] });
        }

        const relLikes1 = results[0].likes - results[1].likes;
        const relLikes2 = results[1].likes - results[0].likes;

        return res.json({
          stockData: [
            {
              stock: results[0].stock,
              price: results[0].price,
              rel_likes: relLikes1
            },
            {
              stock: results[1].stock,
              price: results[1].price,
              rel_likes: relLikes2
            }
          ]
        });

      } catch (err) {
        console.log(err);
        return res.json({ error: 'An error occurred' });
      }
    });

};