import { useState, useEffect } from 'react';
import api from '../api/api';
import Modal from 'react-modal';

export default function LowStock() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockModal, setRestockModal] = useState({ isOpen: false, product: null });
  const [restockQuantity, setRestockQuantity] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    api.get('/inventory/lowstock')
      .then(response => {
        setLowStockItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching low stock items:', error);
        setLoading(false);
      });
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000); // Increased to 5 seconds
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

      // Update just the restocked item in the current list
      setLowStockItems(prevItems => 
        prevItems.map(item => {
          if (item.productId === restockModal.product.productId) {
            return {
              ...item,
              currentStock: item.currentStock + parseInt(restockQuantity)
            };
          }
          return item;
        }).filter(item => item.currentStock <= item.minStock) // Keep only low stock items
      );

      // Show feedback and close modal
      showFeedback('success', `Successfully restocked ${restockModal.product.productName}`);
      setRestockModal({ isOpen: false, product: null });
      setRestockQuantity('');
    } catch (err) {
      showFeedback('error', 'Failed to restock product');
      console.error('Restock error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      {/* Updated Feedback Message with higher z-index */}
      {feedback && (
        <div 
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[9999]
            ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
            text-white transform translate-y-0 transition-all duration-300 ease-in-out`}
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
            <h1 className="text-2xl font-bold text-orange-700">Low Stock Items</h1>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Items Below Threshold
            </span>
          </div>

          <div className="bg-white shadow-md rounded">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">{item.productName}</td>
                    <td className="px-6 py-4">{item.currentStock}</td>
                    <td className="px-6 py-4">{item.minStock}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setRestockModal({ isOpen: true, product: item })}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Restock Modal */}
          <Modal
            isOpen={restockModal.isOpen}
            onRequestClose={() => setRestockModal({ isOpen: false, product: null })}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50"
          >
            <h2 className="text-xl font-bold mb-4">Restock Product</h2>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                <input
                  type="text"
                  value={restockModal.product?.currentStock || 0}
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
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 relative"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="opacity-0">Restock</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </>
                  ) : (
                    'Restock'
                  )}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
}
