import toSql from '../src/sql_writer';
import asyncToSql from '../src/async_sql_writer';
import { AsyncIterable2Array, string2Stream } from '../src/utils';
import { asyncMongoLexer } from '../src/mongo';

describe.each([
  ['sync', (input: string) => Promise.resolve(toSql(input))],
  ['async', (input: string) => asyncToSql(string2Stream(input)).next().then(item => item.value)],
])
  ('Mongo %s Lexer Tests', (type, toSql) => {

    it.each([
        ["db.users.find({ });", "SELECT * FROM users;"],
        ["db.users.find({ name: 'john doe', age: { $gt: 30 } });", "SELECT * FROM users WHERE name = 'john doe' AND age > 30;"],
        ["db.products.find({ category: 'electronics' }, { name: 1, price: 1, _id: 1 });", "SELECT name, price, _id FROM products WHERE category = 'electronics';"],
        ["db.orders.find({ totalAmount: { $lte: 100 } });", "SELECT * FROM orders WHERE totalAmount <= 100;"],
        ["db.items.find({ status: { $ne: 'deleted' } });", "SELECT * FROM items WHERE status != 'deleted';"],
        ["db.products.find({ category: { $in: ['electronics', 'books', 'assets'] } });", "SELECT * FROM products WHERE category IN ('electronics', 'books', 'assets');"],
        ["db.users.find({ $and: [ { age: { $gt: 25 } }, { country: 'USA' } ] });", "SELECT * FROM users WHERE ((age > 25) AND (country = 'USA'));"],
        ["db.orders.find({ $or: [ { status: 'pending' }, { amount: { $lt: 50 } } ] });", "SELECT * FROM orders WHERE ((status = 'pending') OR (amount < 50));"],
        ["db.customers.find({ $and: [ { isActive: true }, { $or: [ { city: 'NY' }, { zip: '10001' } ] } ] });", "SELECT * FROM customers WHERE ((isActive = TRUE) AND (((city = 'NY') OR (zip = '10001'))));"]
    ])('should translate a %s to %s', async (mongoQuery, sqlQuery) => {
        
        const sql = await toSql(mongoQuery);
        expect(sql).toBe(sqlQuery);
    });


});