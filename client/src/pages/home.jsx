import { useEffect, useState } from "react";
import apiClient from "../helpers/http-client";

export default function home() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Product List</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
