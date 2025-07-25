import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import api from '../api/api';
import Price from './Price';
import InvoiceModal from './InvoiceModal';
import { useCart } from '../context/CartContext';

export default function SalesCreate() {
  const { cart, addToCart: addToCartFromContext, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cashReceived, setCashReceived] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  // Enhanced cart loading from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('salesCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          // Ensure all numeric values are properly parsed
          const validatedCart = parsedCart.map(item => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice),
            quantity: parseInt(item.quantity),
            discountPercentage: parseFloat(item.discountPercentage || 0)
          }));
          setCart(validatedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem('salesCart');
    }
  }, []);

  // Save cart to localStorage with proper number parsing
  useEffect(() => {
    if (cart.length > 0) {
      const cartToSave = cart.map(item => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice),
        quantity: parseInt(item.quantity),
        discountPercentage: parseFloat(item.discountPercentage || 0)
      }));
      localStorage.setItem('salesCart', JSON.stringify(cartToSave));
    } else {
      localStorage.removeItem('salesCart');
    }
  }, [cart]);

  // Safe calculation helper
  const safeCalculate = (calculation) => {
    try {
      const result = calculation();
      return isNaN(result) || !isFinite(result) ? 0 : result;
    } catch {
      return 0;
    }
  };

  // Remove duplicate calculations and use safe calculation helper
  // Update cartCalculations to properly calculate VAT
  const cartCalculations = {
    subtotalBeforeDiscount: safeCalculate(() => 
      cart.reduce((sum, item) => 
        sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)), 0)
    ),
    totalDiscountAmount: 0,
    subtotalAfterDiscount: 0,
    vatAmount: 0,
    finalTotal: 0,
    change: 0
  };

  // Calculate derived values
  cartCalculations.totalDiscountAmount = safeCalculate(() => 
    cart.reduce((sum, item) => {
      const itemSubtotal = parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0);
      return sum + (itemSubtotal * (parseFloat(item.discountPercentage || 0) / 100));
    }, 0)
  );

  cartCalculations.subtotalAfterDiscount = cartCalculations.subtotalBeforeDiscount - cartCalculations.totalDiscountAmount;
  cartCalculations.vatAmount = safeCalculate(() => cartCalculations.subtotalAfterDiscount * 0.15); // Fix VAT calculation
  cartCalculations.finalTotal = cartCalculations.subtotalAfterDiscount + cartCalculations.vatAmount;
  cartCalculations.change = paymentMethod === 'Cash' 
    ? Math.max(0, parseFloat(cashReceived || 0) - cartCalculations.finalTotal) 
    : 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('salesCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate cart data
        if (Array.isArray(parsedCart) && parsedCart.every(item => 
          item.id && 
          item.name && 
          typeof item.unitPrice === 'number' && 
          typeof item.quantity === 'number'
        )) {
          setCart(parsedCart);
        } else {
          // If invalid data, clear storage
          localStorage.removeItem('salesCart');
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem('salesCart');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('salesCart', JSON.stringify(cart));
  }, [cart]);

  const handleCategorySelect = async (categoryId) => {
    try {
      setSelectedCategory(categoryId);
      const response = await api.get(`/categories/${categoryId}/products`);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const playBeepSound = () => {
    try {
      const audio = new Audio(`${window.location.origin}/sounds/beep.mp3`);
      audio.volume = 1.0;
      audio.play().catch(err => {
        console.warn('Sound play failed:', err);
        // Continue with add to cart even if sound fails
      });
    } catch (err) {
      console.warn('Sound creation failed:', err);
      // Continue with add to cart even if sound fails
    }
  };

  // Update handleBarcodeSubmit to use addToCartFromContext directly
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode) return;

    try {
      const response = await api.get(`/product/barcode/${barcode}`);
      if (response.data) {
        const productData = {
          ...response.data,
          id: response.data.productId || response.data.id,
          name: response.data.productName || response.data.name,
          brand: response.data.brand,
          unitPrice: parseFloat(response.data.unitPrice || response.data.price),
          discountPercentage: parseFloat(response.data.discountPercentage || 0),
          barcode: barcode,
          imageUrl: response.data.imageUrl
        };
        addToCartFromContext(productData);
        setBarcode('');
        playBeepSound();
        showFeedback('success', `Added ${productData.brand} ${productData.name}`);
      }
    } catch (err) {
      setError('Product not found');
      showFeedback('error', 'Product not found');
    }
  };

  // Add showFeedback helper function
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || isProcessing) return;

    try {
      setIsProcessing(true);
      
      const saleRequest = {
        Items: cart.map(item => ({
          ProductID: parseInt(item.id),
          Quantity: parseInt(item.quantity),
          UnitPrice: parseFloat(item.unitPrice),
          DiscountPercentage: parseFloat(item.discountPercentage || 0),
          Subtotal: parseFloat(item.unitPrice) * parseInt(item.quantity)
        })),
        PaymentMethod: paymentMethod,
        CashReceived: parseFloat(cashReceived || 0),
        Change: cartCalculations.change,
        SubtotalBeforeDiscount: cartCalculations.subtotalBeforeDiscount,
        TotalDiscountPercentage: cartCalculations.totalDiscountAmount / cartCalculations.subtotalBeforeDiscount * 100,
        TotalDiscountAmount: cartCalculations.totalDiscountAmount,
        SubtotalAfterDiscount: cartCalculations.subtotalAfterDiscount,
        TotalVATAmount: cartCalculations.vatAmount,
        VATPercentage: 15,
        FinalTotal: cartCalculations.finalTotal,
        CustomerName: "",
        CustomerPhone: ""
      };

      const response = await api.post('/sales', saleRequest);
      
      if (response.data) {
        const newInvoiceData = {
          invoiceNumber: response.data.invoiceNumber,
          date: new Date(),
          items: cart.map(item => ({
            ...item,
            subtotal: item.unitPrice * item.quantity,
            vatAmount: (item.unitPrice * item.quantity * (1 - (item.discountPercentage || 0) / 100)) * 0.15
          })),
          subtotalBeforeDiscount: cartCalculations.subtotalBeforeDiscount,
          totalDiscountAmount: cartCalculations.totalDiscountAmount,
          subtotalAfterDiscount: cartCalculations.subtotalAfterDiscount,
          totalVATAmount: cartCalculations.vatAmount, // Pass the VAT amount directly
          finalTotal: cartCalculations.finalTotal,
          paymentMethod,
          cashReceived: parseFloat(cashReceived || 0),
          change: cartCalculations.change
        };

        setInvoiceData(newInvoiceData);
        clearCart(); // Clear cart after successful sale
        setTimeout(() => setShowInvoice(true), 100);
      }
    } catch (err) {
      console.error('Sale error:', err);
      setError('Failed to process sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setInvoiceData(null);
    clearCart();
    setTimeout(() => {
      navigate('/sales');
    }, 100);
  };

  // Update formatProductName function to always return an array
  const formatProductName = (name) => {
    if (!name) return [''];
    
    const words = name.split(' ');
    let lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if ((currentLine + ' ' + word).length > 20) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    return lines;
  };

  // Add this function before the cash input usage
  const handleCashReceived = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCashReceived(value);
    }
  };

  // Add validation for cash payment
  const isCashPaymentValid = () => {
    if (paymentMethod !== 'Cash') return true;
    const cashAmount = parseFloat(cashReceived || 0);
    return cashAmount >= cartCalculations.finalTotal;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <div className="inline-block w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Processing Sale...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Move feedback message to fixed position at the top center */}
        {feedback && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 
            px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2
            ${feedback.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
            } animate-fade-in-down`}
          >
            <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Top Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <form onSubmit={handleBarcodeSubmit} className="flex-1 flex space-x-4">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scan/Enter Barcode"
                autoFocus
              />
              <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Add Product
              </button>
            </form>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Browse Products
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Section */}
          <div className="flex-1">
            {cart.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Barcode</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Brand</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Price</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Discount</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Subtotal</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">VAT</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => {
                      const itemSubtotal = item.unitPrice * item.quantity;
                      const itemDiscount = itemSubtotal * (item.discountPercentage / 100);
                      const itemAfterDiscount = itemSubtotal - itemDiscount;
                      const itemVAT = itemAfterDiscount * 0.15;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">{item.barcode || '-'}</td>
                          <td className="px-4 py-3 whitespace-pre-line max-w-[200px]">
                            {formatProductName(item.name).map((line, index) => (
                              <React.Fragment key={`${item.id}-line-${index}`}>
                                {line}
                                {index < formatProductName(item.name).length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </td>
                          <td className="px-4 py-3">{item.brand}</td>
                          <td className="px-4 py-3"><Price amount={item.unitPrice} /></td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                              className="w-16 p-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            {item.discountPercentage > 0 ? (
                              <span className="text-green-600">
                                {item.discountPercentage}% (<Price amount={itemDiscount} />)
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3"><Price amount={itemAfterDiscount} /></td>
                          <td className="px-4 py-3"><Price amount={itemVAT} /></td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <i className="fas fa-shopping-cart text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Cart is Empty</h3>
                  <p className="text-gray-500 max-w-md">
                    Start adding products by:
                  </p>
                  <div className="flex items-center justify-center space-x-6 mt-4">
                    <div className="flex flex-col items-center text-gray-600">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <i className="fas fa-barcode text-blue-500"></i>
                      </div>
                      <span className="text-sm">Scan Barcode</span>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="flex flex-col items-center text-gray-600">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                        <i className="fas fa-search text-green-500"></i>
                      </div>
                      <span className="text-sm">Browse Products</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Add Products</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sale Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow p-6 lg:sticky lg:top-4">
              <h2 className="text-xl font-bold mb-6">Sale Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <Price amount={cartCalculations.subtotalBeforeDiscount} />
                </div>
                {cartCalculations.totalDiscountAmount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Discount:</span>
                      <span className="text-green-600">
                        ({((cartCalculations.totalDiscountAmount / cartCalculations.subtotalBeforeDiscount) * 100).toFixed(1)}%) 
                        <Price amount={cartCalculations.totalDiscountAmount} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal After Discount:</span>
                      <Price amount={cartCalculations.subtotalAfterDiscount} />
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (15%):</span>
                  <Price amount={cartCalculations.vatAmount} />
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Final Total:</span>
                    <Price amount={cartCalculations.finalTotal} />
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      // Reset cash received when switching payment method
                      if (e.target.value !== 'Cash') {
                        setCashReceived('');
                      }
                    }}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="Card">Card Payment</option>
                    <option value="Cash">Cash Payment</option>
                  </select>

                  {paymentMethod === 'Cash' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={cashReceived}
                        onChange={handleCashReceived}
                        className={`w-full p-3 border rounded-lg ${
                          cashReceived && !isCashPaymentValid() 
                            ? 'border-red-500 bg-red-50' 
                            : ''
                        }`}
                        placeholder="Cash Received"
                        inputMode="decimal"
                      />
                      {cashReceived && !isCashPaymentValid() && (
                        <p className="text-red-500 text-sm">
                          Cash received must be greater than or equal to the final total
                        </p>
                      )}
                      {parseFloat(cashReceived || 0) > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Change:</span>
                          <Price amount={cartCalculations.change} />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={cart.length === 0 || !isCashPaymentValid() || isProcessing}
                    className={`w-full py-3 relative ${
                      cart.length === 0 || !isCashPaymentValid() || isProcessing
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white rounded-lg flex items-center justify-center`}
                  >
                    {isProcessing && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
                        <span className="inline-block w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin mr-2"></span>
                      </span>
                    )}
                    <span className={isProcessing ? 'opacity-0' : ''}>
                      Complete Sale
                    </span>
                  </button>
                  
                  <button
                    onClick={clearCart}
                    disabled={cart.length === 0}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Browse Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onRequestClose={() => setIsModalOpen(false)}
          shouldCloseOnOverlayClick={false}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto p-6"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Browse Products</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 rounded-lg shadow text-center transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-50 border'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {selectedCategory && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.map(product => {
                    // Handle API response format
                    const price = parseFloat(product.price || product.unitPrice || 0);
                    const stock = parseInt(product.stock || product.stockQuantity || 0);
                    const discount = parseFloat(product.discountPercentage || 0);
                    const productId = product.productID || product.id;
                    const name = product.name || product.productName;

                    return (
                      <div key={productId} className="border rounded-lg p-4 flex flex-col">
                        <div className="flex-1">
                          <img
                            src={product.imageUrl || 'https://placehold.co/200x200?text=No+Image'}
                            alt={`${product.brand} ${name}`}
                            className="w-full h-32 object-contain mb-4"
                            onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=No+Image' }}
                          />
                          <h4 className="font-semibold text-lg mb-2">
                            {`${product.brand || ''} ${name}`}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {product.barcode && (
                              <p className="text-gray-600 flex items-center">
                                <i className="fas fa-barcode mr-2"></i>
                                {product.barcode}
                              </p>
                            )}
                            <div className="flex justify-between items-center">
                              <div className="font-bold text-lg text-blue-600">
                                <Price amount={price} />
                              </div>
                              {discount > 0 && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${stock <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                              {stock === 0 ? (
                                <span className="font-bold">Out of Stock</span>
                              ) : (
                                <span>In Stock: {stock}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addToCartFromContext({
                              id: productId,
                              name: name,
                              brand: product.brand,
                              unitPrice: price,
                              barcode: product.barcode,
                              discountPercentage: discount,
                              stockQuantity: stock,
                              imageUrl: product.imageUrl
                            });
                            playBeepSound();
                            showFeedback('success', `Added ${product.brand} ${name}`);
                          }}
                          disabled={stock === 0}
                          className={`w-full mt-4 px-4 py-2 rounded transition-colors ${
                            stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <InvoiceModal
          key={invoiceData.invoiceNumber}
          isOpen={true}
          onClose={handleCloseInvoice}
          saleData={invoiceData}
          onPrint={handlePrintInvoice}
        />
      )}
    </div>
  );
}

