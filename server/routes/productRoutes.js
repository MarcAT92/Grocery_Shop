import express from 'express';
import { upload } from '../configs/multer.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';
import { addProduct, productById, productList, changeStock, updateProduct, deleteProduct } from '../controllers/productController.js';

const productRouter = express.Router();

// Public routes
productRouter.get('/list', productList);
productRouter.post('/id', productById);

// Admin routes
productRouter.post('/add', upload.array('images'), protectAdmin, addProduct);
productRouter.put('/update', upload.array('images'), protectAdmin, updateProduct);
productRouter.post('/stock', protectAdmin, changeStock);
productRouter.delete('/delete', protectAdmin, deleteProduct);

export default productRouter;