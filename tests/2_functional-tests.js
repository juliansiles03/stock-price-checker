const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  this.timeout(5000);

  // 1. Viewing one stock
  test("Viewing one stock", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "GOOG" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "stockData");
        assert.equal(res.body.stockData.stock, "GOOG");
        assert.isNumber(res.body.stockData.price);
        done();
      });
  });

  // 2. Viewing one stock and liking it
  test("Viewing one stock and liking it", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "AAPL", like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, "likes");
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  // 3. Viewing the same stock and liking it again
  test("Viewing the same stock and liking it again", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: "AAPL", like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const likes = res.body.stockData.likes;

        // Like again → should NOT increase
        chai
          .request(server)
          .get("/api/stock-prices")
          .query({ stock: "AAPL", like: true })
          .end(function (err2, res2) {
            assert.equal(res2.status, 200);
            assert.equal(res2.body.stockData.likes, likes);
            done();
          });
      });
  });

  // 4. Viewing two stocks
  test("Viewing two stocks", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: ["GOOG", "MSFT"] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "rel_likes");
        done();
      });
  });

  // 5. Viewing two stocks and liking them
  test("Viewing two stocks and liking them", function (done) {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: ["GOOG", "MSFT"], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], "rel_likes");
        assert.property(res.body.stockData[1], "rel_likes");
        done();
      });
  });
});