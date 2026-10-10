import { useState } from "react";
import { addProduct } from "../api/productApi";
import type { Product } from "../types/product";

interface Props {
    onProductAdded: (product: Product) => void;
}

function ProductForm({ onProductAdded }: Props) {
    const [product, setProduct] = useState<Omit<Product, "productId">>({
        productName: "",
        category: "",
        description: "",
        price: 0,
        stock: 0,
        imageUrl: "",
        rating: 0,
        status: "AVAILABLE"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setProduct({
            ...product,
            [name]: ["price", "stock", "rating"].includes(name)
                ? Number(value)
                : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await addProduct(product);
            onProductAdded(data);

            setProduct({
                productName: "",
                category: "",
                description: "",
                price: 0,
                stock: 0,
                imageUrl: "",
                rating: 0,
                status: "AVAILABLE"
            });
        } catch {
            alert("Unable to add product");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <h2>Add Product</h2>

            <input name="productName" placeholder="Product Name"
                value={product.productName} onChange={handleChange} required />

            <input name="category" placeholder="Category"
                value={product.category} onChange={handleChange} required />

            <input name="description" placeholder="Description"
                value={product.description} onChange={handleChange} required />

            <input name="price" type="number" placeholder="Price"
                value={product.price} onChange={handleChange} required />

            <input name="stock" type="number" placeholder="Stock"
                value={product.stock} onChange={handleChange} required />

            <input name="imageUrl" placeholder="Image URL"
                value={product.imageUrl} onChange={handleChange} />

            <input name="rating" type="number" step="0.1" placeholder="Rating"
                value={product.rating} onChange={handleChange} />

            <select name="status" value={product.status} onChange={(e) =>
                setProduct({ ...product, status: e.target.value })}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            </select>

            <button type="submit">Add Product</button>
        </form>
    );
}

export default ProductForm;
