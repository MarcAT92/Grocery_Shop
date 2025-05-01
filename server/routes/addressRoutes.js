import express from 'express';
import { 
    addAddress, 
    getAddresses, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress, 
    getDefaultAddress 
} from '../controllers/addressController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const addressRouter = express.Router();

// All routes are protected with verifyAuth middleware
addressRouter.post('/add', verifyAuth, addAddress);
addressRouter.post('/list', verifyAuth, getAddresses);
addressRouter.put('/update', verifyAuth, updateAddress);
addressRouter.delete('/delete', verifyAuth, deleteAddress);
addressRouter.put('/set-default', verifyAuth, setDefaultAddress);
addressRouter.post('/default', verifyAuth, getDefaultAddress);

export default addressRouter;
