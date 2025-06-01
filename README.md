# node-mongo2sql
`mongo2sql` is a versatile library designed for bidirectional translation between MongoDB queries (specifically the `find` syntax and its operators) and standard SQL statements. This project goes beyond a simple JSON-to-SQL conversion; it interprets MongoDB expressions and operators, offering a robust solution for environments that require interoperability between NoSQL and relational databases.

## Features

* **MongoDB to SQL Translation:** Converts MongoDB `find` query objects into SQL `SELECT` statements.
* **MongoDB Operator Support:** Interprets common MongoDB query operators like `$eq`, `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$nin`, `$and`, `$or`, `$not`, `$nor`, and more.
