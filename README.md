# node-mongo2sql
`mongo2sql` is a versatile library designed for bidirectional translation between MongoDB queries (specifically the `find` syntax and its operators) and standard SQL statements. This project goes beyond a simple JSON-to-SQL conversion; it interprets MongoDB expressions and operators, offering a robust solution for environments that require interoperability between NoSQL and relational databases.

## Features

* **MongoDB to SQL Translation:** Converts MongoDB `find` query objects into SQL `SELECT` statements.
* **MongoDB Operator Support:** Interprets common MongoDB query operators like `$eq`, `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$in`, `$and` and`$or`, (currently).
* **Query Validation:** Includes a robust lexer and parser that process the MongoDB query, ensuring its structure and detecting syntax errors before translation.
* **Security:** The tokenization and parsing process actively mitigates risks associated with `eval()` or code injection by safely processing input.
* **Extensible:** The lexer/parser/translator architecture allows for easy extension to support new MongoDB operators or SQL functionalities.


## Usage

To run this tool from the command line, you can pipe a MongoDB query string into its standard input. The translated SQL will then print directly to your console.

**Example:**

```bash
echo "db.users.find({ age: { \$gt: 25 } });" | npm start
```

## Contributing

Contributions are welcome! If you find a bug, have a suggestion for improvement, or want to add support for new operators or functionalities, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.