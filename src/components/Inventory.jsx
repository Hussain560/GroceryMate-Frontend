import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import { getUserRole } from '../utils/auth';
import Price from './Price';
import Pagination from './Pagination';
import Modal from 'react-modal';

export default function Inventory() {
  // 1. All useState hooks at the top
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: ''
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [spoilModal, setSpoilModal] = useState({ isOpen: false, product: null });
  const [spoilageData, setSpoilageData] = useState({ quantity: 1, reason: '' });
  const [feedback, setFeedback] = useState(null);

  // 2. Constants and variables
  const isManager = getUserRole() === 'Manager';
  const navigate = useNavigate();
  const location = useLocation();
  const defaultImage = 'https://placehold.co/200x200?text=No+Image';
  const itemsPerPage = 30;

  // 3. Helper functions
  const paginateProducts = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.brand || product.brand === filters.brand)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // 4. Event handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/product/${deleteModal.product.id}`);
      setProducts(products.filter(p => p.id !== deleteModal.product.id));
      showFeedback('success', 'Product deleted successfully');
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
      showFeedback('error', 'Failed to delete product');
    }
  };

  const handleSpoilage = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/spoilage', {
        productId: spoilModal.product.id,
        quantity: parseInt(spoilageData.quantity),
        reason: spoilageData.reason
      });
      
      // Update only the affected product in the local state
      const updatedProducts = products.map(p => {
        if (p.id === spoilModal.product.id) {
          return {
            ...p,
            quantity: p.quantity - parseInt(spoilageData.quantity)
          };
        }
        return p;
      });
      setProducts(updatedProducts);
      
      showFeedback('success', 'Spoilage recorded successfully');
      setSpoilModal({ isOpen: false, product: null });
      setSpoilageData({ quantity: 1, reason: '' });
    } catch (error) {
      console.error('Error recording spoilage:', error);
      showFeedback('error', 'Failed to record spoilage');
    }
  };

  // 5. All useEffect hooks together
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    console.log('Inventory component mounted'); // Debug log
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/product'),
          api.get('/categories')
        ]);

        // Sanitize the products data
        const sanitizedProducts = productsRes.data.map(product => ({
          ...product,
          price: product.unitPrice,
          quantity: product.stockQuantity,
          discountPercentage: Number(product.discountPercentage || 0),
          reorderLevel: Number(product.reorderLevel || 0)
        }));

        setProducts(sanitizedProducts);
        
        // Set categories from API
        setCategories(categoriesRes.data);
        
        // Extract unique brands from products
        const uniqueBrands = [...new Set(sanitizedProducts.map(p => p.brand))];
        setBrands(uniqueBrands.filter(Boolean));
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
        setCategories([]);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Check for state passed from navigation
    const state = location.state;
    if (state?.feedback) {
      showFeedback(state.feedback.type, state.feedback.message);
      // Clean up the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 6. Loading check
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 7. Render functions
  const renderActions = (product) => (
    <div className="flex items-center space-x-2">
      {isManager && (
        <>
          <button
            onClick={() => navigate(`/inventory/edit/${product.id}`)}
            className="p-1.5 rounded-full text-blue-600 hover:text-white hover:bg-blue-600"
            title="Edit Product"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, product })}
            className="p-1.5 rounded-full text-red-600 hover:text-white hover:bg-red-600"
            title="Delete Product"
          >
            <i className="fas fa-trash"></i>
          </button>
        </>
      )}
      <button
        onClick={() => setSpoilModal({ isOpen: true, product })}
        className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      >
        <i className="fas fa-exclamation-triangle mr-1"></i>
        <span className="text-xs">Spoil</span>
      </button>
    </div>
  );

  const renderViewToggle = () => (
    <div className="flex justify-end mb-4">
      <div className="flex gap-2 bg-white p-1 rounded-lg shadow">
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'list' 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-gray-100'
          }`}
          title="List View"
        >
          <i className="fas fa-list text-lg"></i>
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'grid' 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-gray-100'
          }`}
          title="Grid View"
        >
          <i className="fas fa-th text-lg"></i>
        </button>
      </div>
    </div>
  );

  const renderGridActions = (product) => (
    <div className="mt-4 p-3 bg-gray-50 flex justify-end">
      {renderActions(product)}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginateProducts(filteredProducts).map(product => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={product.imageUrl || defaultImage}
                  alt={product.name}
                  className="h-12 w-12 object-cover rounded"
                  onError={(e) => { e.target.src = defaultImage }}
                />
              </td>
              <td className="px-6 py-4">{product.name}</td>
              <td className="px-6 py-4">{product.category}</td>
              <td className="px-6 py-4">{product.brand}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{product.supplier}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <i className="fas fa-barcode mr-1"></i>
                  {product.barcode}
                </span>
              </td>
              <td className="px-6 py-4">
                <Price amount={product.price} />
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  product.quantity <= product.reorderLevel 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {product.quantity}
                </span>
              </td>
              <td className="px-6 py-4">
                {renderActions(product)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="py-4">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );

  const renderGridView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginateProducts(filteredProducts).map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="relative pt-[100%] w-full overflow-hidden bg-gray-100">
              <img
                src={product.imageUrl || defaultImage}
                alt={product.name}
                className="absolute top-0 left-0 w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = defaultImage }}
                loading="lazy"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                <p className="text-sm text-gray-600">Category: {product.category}</p>
                <p className="text-sm text-gray-600">Supplier: {product.supplier}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <i className="fas fa-barcode mr-1"></i>
                  {product.barcode}
                </p>
                <p className="text-lg font-bold text-indigo-600">
                  <Price amount={product.price} />
                </p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.quantity <= product.reorderLevel 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Stock: {product.quantity}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>
              </div>
              {renderGridActions(product)}
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );

  // Add modal components
  const DeleteModal = () => (
    <Modal
      isOpen={deleteModal.isOpen}
      onRequestClose={() => setDeleteModal({ isOpen: false, product: null })}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <h2 className="text-xl font-bold mb-4">Delete Product</h2>
      <p>Are you sure you want to delete "{deleteModal.product?.name}"?</p>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={() => setDeleteModal({ isOpen: false, product: null })}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </Modal>
  );

  const spoilageReasons = [
    "Expired Product",
    "Damaged Packaging",
    "Quality Issues",
    "Storage Problems",
    "Transport Damage",
    "Temperature Control Failure",
    "Other"
  ];

  const SpoilageModal = () => (
    <Modal
      isOpen={spoilModal.isOpen}
      onRequestClose={() => setSpoilModal({ isOpen: false, product: null })}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      shouldFocusAfterRender={false}
      shouldReturnFocusAfterClose={false}
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <h2 className="text-xl font-bold mb-4">Record Spoilage</h2>
      <form onSubmit={handleSpoilage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Stock</label>
          <input
            type="text"
            value={spoilModal.product?.quantity || 0}
            className="mt-1 w-full rounded-md border-gray-300 bg-gray-50"
            disabled
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity to Spoil</label>
          <input
            type="number"
            min="1"
            max={spoilModal.product?.quantity}
            value={spoilageData.quantity}
            onChange={(e) => setSpoilageData(prev => ({ ...prev, quantity: e.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <select
            value={spoilageData.reason}
            onChange={(e) => setSpoilageData(prev => ({ ...prev, reason: e.target.value }))}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Reason</option>
            {spoilageReasons.map(reason => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          {spoilageData.reason === 'Other' && (
            <textarea
              value={spoilageData.otherReason || ''}
              onChange={(e) => setSpoilageData(prev => ({ 
                ...prev, 
                otherReason: e.target.value,
                reason: e.target.value ? 'Other: ' + e.target.value : 'Other'
              }))}
              className="mt-2 w-full rounded-md border-gray-300"
              placeholder="Please specify the reason"
              required={spoilageData.reason === 'Other'}
              rows={2}
            />
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setSpoilModal({ isOpen: false, product: null })}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Record Spoilage
          </button>
        </div>
      </form>
    </Modal>
  );

  // 8. Main render
  return (
    <>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Move feedback message to the bottom right corner */}
            {feedback && (
              <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 
                ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
                text-white animate-slide-up`}
              >
                <div className="flex items-center">
                  <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                  <span>{feedback.message}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Inventory Management</h1>
              <div className="flex space-x-2">
                {isManager && (
                  <>
                    <button 
                      onClick={() => navigate('/inventory/add')} 
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Add Product
                    </button>
                    <button 
                      onClick={() => navigate('/inventory/restock')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Restock
                    </button>
                  </>
                )}
                <button 
                  onClick={() => navigate('/inventory/transactions')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Transactions
                </button>
              </div>
            </div>

            {/* View toggle buttons */}
            {renderViewToggle()}

            {/* Search and filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search products..."
                className="p-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="p-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="p-2 border rounded-lg"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Products list/grid */}
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found.
              </div>
            ) : (
              viewMode === 'list' ? renderListView() : renderGridView()
            )}
          </div>
        </div>
      </div>
      <DeleteModal />
      <SpoilageModal />
    </>
  );
}



