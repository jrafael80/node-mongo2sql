import toSql from './async_sql_writer';

process.stdin.setEncoding('utf8');
(async () => {
    try {
        for await(const sql of toSql(process.stdin)) {  
            console.log(sql);
        }
    } catch (error) {
        console.log(`Error: ${error}\n`);
        process.exit(1);
    }
})()

