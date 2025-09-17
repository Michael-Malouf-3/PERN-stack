import db from "../config/db.js";

export const getProducts = async (req, res) => {
    try {
        const products = await db.queryMany(`SELECT * FROM products ORDER BY created_at DESC`);
        console.log(`fetched products: ${products}`);
        res.status(200).json({success: true, data: products});
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({success: false, error: "Failed to fetch products"});
    }
};


export const createProduct = async (req, res) => {
    const { name, price, image } = req.body;
    if(!name || !price || !image) {
        return res.status(400).json({success: false, error: "Please provide name, price, and image for the product"});
    }
    try {
        const newProduct = await db.query(
            `INSERT INTO products (name, price, image) VALUES ($1, $2, $3) RETURNING *`,
            [name, price, image]
        );
        console.log(`created product: ${newProduct}`);
        res.status(201).json({success: true, data: newProduct[0]});
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({success: false, error: "Failed to create product"});
    }
};


export const getProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db.queryOne(`SELECT * FROM products WHERE id = $1`, [id]);
        res.status(200).json({success: true, data: product});
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({success: false, error: "Failed to fetch product"});
    }
};


export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, image } = req.body;
    try {
        let updatedProduct;
        await db.transaction(async (client) => {
            // 1. Check if product exists
            const existingProduct = await client.query(`SELECT * FROM products WHERE id = $1`, [id]);
            if (!existingProduct) {
                return res.status(404).json({success: false, error: "Product not found"});
            }
            
            // 2. Update the product
            const result = await client.query(
                `UPDATE products SET name = $1, price = $2, image = $3 WHERE id = $4 RETURNING *`,
                [name || existingProduct.name, price || existingProduct.price, image || existingProduct.image, id]
            );
            updatedProduct = result.rows[0];
        });
        res.status(200).json({success: true, data: updatedProduct});
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({success: false, error: "Failed to update product"});
    }
    
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await db.queryOne(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
        if (!deletedProduct) {
            return res.status(404).json({success: false, error: "Product not found"});
        }
        res.status(200).json({success: true, data: deletedProduct});
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({success: false, error: "Failed to delete product"});
    }
};