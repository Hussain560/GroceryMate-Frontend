import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

export default function InventoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState({
    name: '',
    brand: '',
    category: '',
    unitPrice: 0,
    stockQuantity: 0,
    reorderLevel: 0,
    barcode: '',
    imageUrl: '',
    discountPercentage: 0
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/product')
        ]);
        
        setCategories(categoriesRes.data);
        // Extract unique brands from products
        const uniqueBrands = [...new Set(productsRes.data.map(p => p.brand))];
        setBrands(uniqueBrands.filter(Boolean));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/product/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/product/${id}`, {
        ...product,
        stockQuantity: parseInt(product.stockQuantity),
        reorderLevel: parseInt(product.reorderLevel),
        unitPrice: parseFloat(product.unitPrice),
        discountPercentage: parseFloat(product.discountPercentage)
      });
      alert('Product updated successfully');
      navigate('/inventory');
    } catch (err) {
      setError('Failed to update product');
      console.error('Error:', err);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              value={product.name}
              onChange={e => setProduct({...product, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <select
              value={product.brand}
              onChange={e => setProduct({...product, brand: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={product.category}
              onChange={e => setProduct({...product, category: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Price (SAR)</label>
            <input
              type="number"
              step="0.01"
              value={product.unitPrice}
              onChange={e => setProduct({...product, unitPrice: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              value={product.stockQuantity}
              onChange={e => setProduct({...product, stockQuantity: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
            <input
              type="number"
              value={product.reorderLevel}
              onChange={e => setProduct({...product, reorderLevel: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Barcode</label>
            <input
              type="text"
              value={product.barcode}
              onChange={e => setProduct({...product, barcode: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={product.imageUrl}
              onChange={e => setProduct({...product, imageUrl: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={product.discountPercentage}
              onChange={e => setProduct({...product, discountPercentage: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
