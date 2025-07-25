import { useState, useEffect } from 'react';
import api from '../api/api';
import Price from './Price';
import Modal from 'react-modal';

export default function InventoryLowstock() {
  const [viewMode, setViewMode] = useState('list');
  const [restockModal, setRestockModal] = useState({ isOpen: false, product: null });
  const [restockQuantity, setRestockQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory/lowstock');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch low stock items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    // Clear feedback after 5 seconds
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await api.post('/inventory/restock', {
        productId: restockModal.product.productId,
        quantity: parseInt(restockQuantity),
        notes: "Regular restock"
      });

      // First update local state
      const updatedItems = products
        .map(item => {
          if (item.productId === restockModal.product.productId) {
            const newStock = item.stockQuantity + parseInt(restockQuantity);
            return {
              ...item,
              stockQuantity: newStock
            };
          }
          return item;
        })
        .filter(item => item.stockQuantity <= item.lowStockThreshold); // Remove items no longer low in stock

      setProducts(updatedItems);
      
      // Then show feedback and close modal
      showFeedback('success', `Successfully restocked ${restockModal.product.productName}`);
      
      // Reset form and close modal
      setRestockModal({ isOpen: false, product: null });
      setRestockQuantity('');
    } catch (err) {
      showFeedback('error', 'Failed to restock product');
      console.error('Restock error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderViewToggle = () => (
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
  );

  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-orange-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map(product => (
            <tr key={product.productId} className="hover:bg-orange-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="h-12 w-12 object-cover rounded"
                  onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=No+Image' }}
                />
              </td>
              <td className="px-6 py-4">{product.productName}</td>
              <td className="px-6 py-4">{product.brand}</td>
              <td className="px-6 py-4">{product.category}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  product.stockQuantity === 0
                    ? 'bg-red-100 text-red-800'
                    : product.stockQuantity <= product.lowStockThreshold / 2
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.stockQuantity}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-600">
                  {product.lowStockThreshold}
                </span>
              </td>
              <td className="px-6 py-4">
                <Price amount={product.price} />
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-500 flex items-center">
                  <i className="fas fa-barcode mr-1"></i>
                  {product.barcode}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => setRestockModal({ isOpen: true, product })}
                  className="text-orange-600 hover:text-white hover:bg-orange-600 p-2 rounded-full transition-colors"
                  title="Restock"
                >
                  <i className="fas fa-plus-circle"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product.productId} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="relative pt-[100%]">
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="absolute top-0 left-0 w-full h-full object-contain"
              onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=No+Image' }}
            />
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">{product.productName}</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Brand: {product.brand}</p>
              <p className="text-sm text-gray-600">Category: {product.category}</p>
              <p className="text-lg font-bold text-indigo-600">
                <Price amount={product.price} />
              </p>
              <div className="flex justify-between items-center">
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  Stock: {product.stockQuantity}
                </span>
                <button
                  onClick={() => setRestockModal({ isOpen: true, product })}
                  className="text-orange-600 hover:text-white hover:bg-orange-600 p-2 rounded-full transition-colors"
                  title="Restock"
                >
                  <i className="fas fa-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Feedback Message */}
      {feedback && (
        <div 
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[9999]
            ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
            text-white transform translate-y-0 transition-all duration-300 ease-in-out`}
          role="alert"
        >
          <div className="flex items-center">
            <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
            <span className="font-medium">{feedback.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-orange-700">Low Stock Items</h1>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Warning: Items Below Threshold
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {renderViewToggle()}
              <button
                onClick={fetchData}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-orange-100 text-orange-700 rounded border border-orange-200">
              {error}
            </div>
          )}

          {viewMode === 'list' ? renderListView() : renderGridView()}

          {/* Restock Modal */}
          <Modal
            isOpen={restockModal.isOpen}
            onRequestClose={() => !isProcessing && setRestockModal({ isOpen: false, product: null })}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            shouldCloseOnOverlayClick={!isProcessing}
            ariaHideApp={false}
          >
            <h2 className="text-xl font-bold mb-4 text-orange-700">Restock Product</h2>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                <input
                  type="text"
                  value={restockModal.product?.stockQuantity || 0}
                  className="mt-1 w-full rounded-md border-gray-300 bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity to Add</label>
                <input
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="mt-1 w-full rounded-md border-gray-300"
                  min="1"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRestockModal({ isOpen: false, product: null })}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Restock
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
}