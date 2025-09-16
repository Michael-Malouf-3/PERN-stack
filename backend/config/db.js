import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;

class Database {
    // Initialize the connection pool when the class is instantiated
    constructor() {
        this.pool = new Pool({
            host: DB_HOST,
            port: DB_PORT,
            database: DB_DATABASE,
            user: DB_USER,
            password: DB_PASSWORD,
            max: 20, // maximum number of clients in the pool
            idleTimeoutMillis: 30000, // close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
        });
        this.testConnection();
    }
    // Test the database connection when the class is instantiated
    async testConnection() {
        try {
            const client = await this.pool.connect(); // Attempt to connect to the database
            console.log("Connected to the database"); // Log success message
            client.release(); // Release the client back to the pool
        } catch (error) {
            console.error("Database connection error:", error); // Log the error for debugging
            process.exit(1); // Exit the process with failure
        }
    }
    // General method to execute queries with error handling and logging
    async query(text, params = []) { 
        const start = Date.now(); 
        let client; // Declare client variable to hold the database client
        try {
            client = await this.pool.connect(); // Get a client from the pool
            const result = await client.query(text, params); // Execute the query
            const duration = Date.now() - start; 
            console.log("Executed query", { text, duration, rows: result.rowCount }); 
            return result; 
        } catch (error) { // Catch any errors during query execution
            console.error("Query error:", {
                query: text,
                params: params,
                error: error.message,
            });
            // Handle specific error codes for easier reading
            if (error.code === '23505') {
                throw new Error('Duplicate entry error');
            }
            else if (error.code === '23503') {
                throw new Error('Reference record does not exist');
            }
            else if (error.code === '42P01') {
                throw new Error('Table does not exist');
            } else {
                throw new Error(`Database query error: ${error}`);
            }
            // Re-throw the error for further handling if needed
        } finally {
            if (client) client.release();
        }
    }
    // Method to handle transactions (multiple queries in a single operation)
    async transaction(callback) {
        // 1. Get a dedicated connection from the pool
        const client = await this.pool.connect();
        try {
        // 2. START the transaction
        await client.query('BEGIN');
        // 3. Execute the user's code (multiple operations)
        const result = await callback(client);
        // 4. If we get here, everything succeeded - COMMIT the changes
        await client.query('COMMIT');
        return result;
        } catch (err) {
        // 5. If ANY error occurred - ROLLBACK (undo) all changes
        await client.query('ROLLBACK');
        throw err; // Re-throw the error so caller knows it failed
        } finally {
        // 6. Always release the connection back to the pool
        client.release();
        }
    }
    // Helper method to fetch a single row
    async queryOne(text, params = []) {
        const result = await this.query(text, params);
        return result.rows[0];
    }
    // Helper method to fetch multiple rows
    async queryMany(text, params = []) {
        const result = await this.query(text, params);
        return result.rows;
    }
    // Close the pool and all its connections
    async close() {
        console.log("Closing database connection...");
        await this.pool.end(); // Close all connections in the pool
    }
}

export default new Database();