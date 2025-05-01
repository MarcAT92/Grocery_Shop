import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate total price of cart
cartSchema.methods.calculateTotal = async function() {
    let total = 0;
    const Product = mongoose.model('product');
    
    for (const item of this.items) {
        const product = await Product.findById(item.productId);
        if (product && product.inStock) {
            total += product.offerPrice * item.quantity;
        }
    }
    
    return total;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
