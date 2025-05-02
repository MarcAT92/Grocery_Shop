import {v2 as cloudinary} from 'cloudinary';
import Product from '../models/productModel.js';
import { logger } from '../utils/logger.js';

// Add Product : /api/product/add
// @route   POST /api/product/add
// @access  Private (Admin only)
export const addProduct = async (req, res) => {
    try {
        // Parse product data from request body
        let productData = JSON.parse(req.body.productData);

        // Get uploaded image files
        const images = req.files;

        if (!images || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product image is required'
            });
        }

        // Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url;
            })
        );

        // Create new product in database
        const product = await Product.create({...productData, image: imagesUrl});

        // Log admin action
        if (req.admin) {
            logger.admin(req.admin.id, req.admin.email, 'ADD_PRODUCT', `Added product: ${product.name} (${product._id})`);
        }

        res.status(201).json({
            success: true,
            message: "Product Added Successfully",
            product
        });
    } catch (error) {
        logger.error('ProductController', 'Add product error', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding product',
            error: error.message
        });
    }
}

// Get Product List : /api/product/list
// @route   GET /api/product/list
// @access  Public
export const productList = async (req, res) => {
    try {
        // Get query parameters for filtering
        const { category, search, inStock } = req.query;

        // Build filter object
        const filter = {};

        // Add category filter if provided
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Add search filter if provided
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // Add inStock filter if provided
        if (inStock !== undefined) {
            filter.inStock = inStock === 'true';
        }

        // Get products from database
        const products = await Product.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        logger.error('ProductController', 'Get product list error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting products',
            error: error.message
        });
    }
}

// Get single Product : /api/product/id
// @route   POST /api/product/id
// @access  Public
export const productById = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Find product by ID
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        logger.error('ProductController', 'Get product by ID error', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting product',
            error: error.message
        });
    }
}

// Change Product inStock : /api/product/stock
// @route   POST /api/product/stock
// @access  Private (Admin only)
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        if (inStock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'inStock status is required'
            });
        }

        // Find and update product
        const product = await Product.findByIdAndUpdate(
            id,
            { inStock },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Log admin action
        if (req.admin) {
            logger.admin(
                req.admin.id,
                req.admin.email,
                'UPDATE_PRODUCT_STOCK',
                `Updated product stock: ${product.name} (${product._id}) - inStock: ${inStock}`
            );
        }

        res.json({
            success: true,
            message: "Product stock updated successfully",
            product
        });
    } catch (error) {
        logger.error('ProductController', 'Change stock error', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating product stock',
            error: error.message
        });
    }
};

// Update Product : /api/product/update
// @route   PUT /api/product/update
// @access  Private (Admin only)
export const updateProduct = async (req, res) => {
    try {
        // Log the request body for debugging in a structured format
        logger.debug('ProductController', 'Update product request', { body: req.body });

        // Try to get ID from multiple possible sources
        let id = req.body.id;
        let productData;

        try {
            productData = JSON.parse(req.body.productData);
            // If ID wasn't in the body directly, try to get it from productData
            if (!id && productData && productData.id) {
                id = productData.id;
            }
        } catch (error) {
            logger.error('ProductController', 'Error parsing productData', error);
            return res.status(400).json({
                success: false,
                message: 'Invalid product data format'
            });
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists
        const existingProduct = await Product.findById(id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            const images = req.files;

            // Upload new images to Cloudinary
            let newImagesUrl = await Promise.all(
                images.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                    return result.secure_url;
                })
            );

            // Combine with existing images or replace them
            if (productData.keepExistingImages) {
                productData.image = [...existingProduct.image, ...newImagesUrl];
            } else {
                productData.image = newImagesUrl;
            }
        } else {
            // Keep existing images if no new ones are uploaded
            productData.image = existingProduct.image;
        }

        // Remove the id from productData before updating
        // to prevent MongoDB from trying to update the _id field
        if (productData.id) {
            delete productData.id;
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            productData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or could not be updated'
            });
        }

        // Log admin action
        if (req.admin) {
            logger.admin(
                req.admin.id,
                req.admin.email,
                'UPDATE_PRODUCT',
                `Updated product: ${updatedProduct.name} (${updatedProduct._id})`
            );
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        logger.error('ProductController', 'Update product error', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating product',
            error: error.message
        });
    }
};

// Delete Product : /api/product/delete
// @route   DELETE /api/product/delete
// @access  Private (Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Find and delete product
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Log admin action
        if (req.admin) {
            logger.admin(
                req.admin.id,
                req.admin.email,
                'DELETE_PRODUCT',
                `Deleted product: ${product.name} (${product._id})`
            );
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        logger.error('ProductController', 'Delete product error', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting product',
            error: error.message
        });
    }
};