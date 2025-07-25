import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function InventoryAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    ProductName: '',
    CategoryID: '',
    BrandID: '',
    SupplierID: '',
    UnitPrice: '',
    DiscountPercentage: '0',
    StockQuantity: '',
    ReorderLevel: '0',
    Barcode: '',
    ImageUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes, suppliersRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/suppliers')
        ]);

        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
        setSuppliers(suppliersRes.data);
      } catch (err) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const productData = {
        ...formData,
        CategoryID: parseInt(formData.CategoryID),
        BrandID: parseInt(formData.BrandID),
        SupplierID: parseInt(formData.SupplierID),
        UnitPrice: parseFloat(formData.UnitPrice),
        DiscountPercentage: parseFloat(formData.DiscountPercentage),
        StockQuantity: parseInt(formData.StockQuantity),
        ReorderLevel: parseInt(formData.ReorderLevel)
      };

      await api.post('/product', productData);
      // Navigate with success feedback
      navigate('/inventory', {
        state: {
          feedback: {
            type: 'success',
            message: `Successfully added ${productData.ProductName} to inventory`
          }
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
      console.error('API Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Move feedback message to top of form */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700">
            {error}
          </div>
        )} 
        
        <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="ProductName"
              value={formData.ProductName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="CategoryID"
              value={formData.CategoryID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <select
              name="BrandID"
              value={formData.BrandID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <select
              name="SupplierID"
              value={formData.SupplierID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Price (SAR)</label>
            <input
              type="number"
              name="UnitPrice"
              value={formData.UnitPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              name="StockQuantity"
              value={formData.StockQuantity}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Barcode</label>
            <input
              type="text"
              name="Barcode"
              value={formData.Barcode}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              name="ImageUrl"
              value={formData.ImageUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
