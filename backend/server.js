// ============================================
// 1. IMPORTS - Loading Required Modules
// ============================================

import express from "express";        // Web framework for Node.js
import helmet from "helmet";          // Security middleware (sets HTTP headers)
import morgan from "morgan";          // HTTP request logger
import cors from "cors";              // Cross-Origin Resource Sharing
import dotenv from "dotenv";          // Loads environment variables from .env file
import productRoutes from "./routes/productRoutes.js"; // Your custom routes
import db from "./config/db.js";      // Your database connection class

/*
WHY THESE IMPORTS?
- express: The main web framework - handles HTTP requests/responses
- helmet: Adds security headers to prevent common attacks
- morgan: Logs every HTTP request to the console for debugging
- cors: Allows your API to be called from different domains (like React frontend)
- dotenv: Reads variables from .env file (like database credentials)
- productRoutes: Your API endpoints for products
- db: Your database connection and query methods
*/

// ============================================
// 2. CONFIGURATION SETUP
// ============================================

dotenv.config(); // Load environment variables from .env file

const app = express(); // Create the Express application instance
const PORT = process.env.PORT || 5000; // Use PORT from .env, or default to 5000


// ============================================
// 3. MIDDLEWARE SETUP - The Request Pipeline
// ============================================

// Middleware runs in ORDER for every request that comes to your server

app.use(express.json()); 
// WHAT IT DOES: Parses JSON from request body
// EXAMPLE: When client sends {"name": "John"}, this makes it available as req.body.name

app.use(cors()); 
// WHAT IT DOES: Allows cross-origin requests
// WHY: Your React frontend (localhost:3000) can call your API (localhost:3000)

app.use(helmet()); 
// WHAT IT DOES: Sets security HTTP headers
// EXAMPLE: X-Content-Type-Options, X-Frame-Options, etc.

app.use(morgan("dev")); 
// WHAT IT DOES: Logs every request to the console
// OUTPUT: "GET /api/products 200 45ms - 1.2kb"

app.use("/api/products", productRoutes);
// WHAT IT DOES: Routes all /api/products/* requests to your productRoutes file
// EXAMPLE: GET /api/products/123 → goes to productRoutes.js

// ============================================
// 4. HEALTH CHECK ROUTES - Testing Your Server
// ============================================

// Basic server health check
app.get("/health/server", (req, res) => {
    res.json({
        message: "Server is running!",
        timestamp: new Date().toISOString()
    });
});

// Database connection health check
app.get("/health/db", async (req, res) => {
    try {
        // Try to run a simple database query
        const result = await db.queryOne('SELECT NOW() as current_time');
        
        // If successful, return success message
        res.json({
        message: "Database connected successfully!",
        timestamp: result.current_time
        });
    } catch (error) {
        // If database fails, log error and return error response
        console.error("Database health check failed:", error);
        res.status(500).json({
        error: "Database connection failed",
        details: error.message
        });
    }
});


// ============================================
// 5. ERROR HANDLING - Catching Problems
// ============================================

// Global error handler - catches all unhandled errors
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error); // Log to console for debugging
    res.status(500).json({
        error: "Internal server error",
        // Only show error details in development (security)
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
});

/*
WHEN IT RUNS: When any route throws an error that isn't caught
EXAMPLE: If database query fails in a route
RESPONSE: {"error": "Internal server error"}
*/

// 404 handler - catches routes that don't exist
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,  // Shows what URL was requested
        method: req.method      // Shows HTTP method (GET, POST, etc.)
    });
});


// ============================================
// 6. GRACEFUL SHUTDOWN - Clean Exit
// ============================================

// Handle SIGTERM signal (deployment shutdown)
process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing HTTP server");
    try {
        await db.close(); // Close database connections properly
        console.log("Database connections closed");
        process.exit(0); // Exit successfully
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1); // Exit with error
    }
});

// Handle SIGINT signal (Ctrl+C shutdown)
process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing HTTP server");
    try {
        await db.close(); // Close database connections properly
        console.log("Database connections closed");
        process.exit(0); // Exit successfully
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1); // Exit with error
    }
});

/*
WHY THIS MATTERS:
- SIGTERM: Sent by deployment platforms when shutting down
- SIGINT: Sent when you press Ctrl+C
- Properly closes database connections to prevent data corruption
- Ensures clean shutdown instead of abrupt termination
*/

// ============================================
// 7. START THE SERVER - Begin Listening
// ============================================

app.listen(PORT, () => {
    console.log(`The server is running on port: ${PORT}`);
});


// ============================================
// REQUEST FLOW EXAMPLE
// ============================================

/*
When a client makes a request, here's what happens:

1. CLIENT REQUEST: GET http://localhost:3000/api/products
    
2. MIDDLEWARE PIPELINE (in order):
    ✅ express.json() - parses JSON body (if any)
    ✅ cors() - adds CORS headers
    ✅ helmet() - adds security headers  
    ✅ morgan() - logs: "GET /api/products 200 45ms"
    
3. ROUTE MATCHING:
    ✅ "/api/products" matches app.use("/api/products", productRoutes)
    ✅ Request goes to productRoutes.js
    
4. ROUTE HANDLER:
    ✅ productRoutes.js handles the specific endpoint
    ✅ Queries database, processes data
    ✅ Sends response back to client
    
5. IF ERROR OCCURS:
    ✅ Global error handler catches it
    ✅ Returns 500 error response
    
6. IF NO ROUTE MATCHES:
    ✅ 404 handler catches it
    ✅ Returns "Route not found" response
*/