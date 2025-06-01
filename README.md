# node-mongo2sql
`mongo2sql` is a versatile library designed for bidirectional translation between MongoDB queries (specifically the `find` syntax and its operators) and standard SQL statements. This project goes beyond a simple JSON-to-SQL conversion; it interprets MongoDB expressions and operators, offering a robust solution for environments that require interoperability between NoSQL and relational databases.

## Features

* **MongoDB to SQL Translation:** Converts MongoDB `find` query objects into SQL `SELECT` statements.
* **MongoDB Operator Support:** Interprets common MongoDB query operators like `$eq`, `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$and` and`$or`, (currently).
* **Query Validation:** Includes a robust lexer and parser that process the MongoDB query, ensuring its structure and detecting syntax errors before translation.
* **Security:** The tokenization and parsing process actively mitigates risks associated with `eval()` or code injection by safely processing input.
* **Extensible:** The lexer/parser/translator architecture allows for easy extension to support new MongoDB operators or SQL functionalities.
