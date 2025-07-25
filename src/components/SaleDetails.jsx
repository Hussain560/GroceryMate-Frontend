import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import Price from './Price';
import InvoiceModal from './InvoiceModal';

export default function SaleDetails() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const { data } = await api.get(`/sales/${id}`);
        setSale(data);
      } catch (err) {
        setError('Failed to fetch sale details');
        console.error('Error fetching sale details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id]);

  const handlePrintInvoice = () => {
    if (!sale) return;

    const formattedInvoiceData = {
      invoiceNumber: sale.invoiceNumber,
      date: sale.saleDate,
      items: sale.items.map(item => ({
        brand: item.brand,
        name: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discountPercentage: item.discountPercentage,
        subtotal: item.lineSubtotalBeforeDiscount,
        vatAmount: item.lineVATAmount
      })),
      subtotalBeforeDiscount: sale.subtotalBeforeDiscount,
      totalDiscountAmount: sale.totalDiscountAmount,
      subtotalAfterDiscount: sale.subtotalAfterDiscount,
      totalVATAmount: sale.totalVATAmount,
      finalTotal: sale.finalTotal,
      paymentMethod: sale.paymentMethod,
      cashReceived: sale.cashReceived,
      change: sale.change
    };

    setInvoiceData(formattedInvoiceData);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setInvoiceData(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!sale) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Actions */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sale Details</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrintInvoice}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <i className="fas fa-print mr-2"></i>
            Print Invoice
          </button>
          <Link
            to="/sales"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Sales
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content - Items Table */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Unit Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Discount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">VAT</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.brand}</div>
                        <div className="text-gray-500 text-sm">{item.productName}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Price amount={item.unitPrice} />
                      </td>
                      <td className="px-6 py-4 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">
                        {item.discountPercentage > 0 ? (
                          <div>
                            <div className="text-green-600">{item.discountPercentage}%</div>
                            <div className="text-sm text-green-500">
                              (<Price amount={item.lineDiscountAmount} />)
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Price amount={item.lineVATAmount} />
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        <Price amount={item.lineFinalTotal} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Floating Totals Section */}
        <div className="lg:w-80">
          <div className="bg-white rounded-lg shadow p-6 lg:sticky lg:top-4">
            <h2 className="text-lg font-semibold mb-4">Sale Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <Price amount={sale.subtotalBeforeDiscount} />
              </div>

              {sale.totalDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Total Discount:</span>
                  <span>-<Price amount={sale.totalDiscountAmount} /></span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">VAT (15%):</span>
                <Price amount={sale.totalVATAmount} />
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>Final Total:</span>
                  <Price amount={sale.finalTotal} />
                </div>
              </div>

              {sale.paymentMethod === 'Cash' && sale.cashReceived > 0 && (
                <div className="pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Received:</span>
                    <Price amount={sale.cashReceived} />
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Change:</span>
                    <Price amount={sale.change} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{sale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    sale.paymentMethod === 'Cash' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sale.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Cashier:</span>
                  <span>{sale.userName}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Date:</span>
                  <span>{new Date(sale.saleDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <InvoiceModal
          key={invoiceData.invoiceNumber}
          isOpen={true}
          onClose={handleCloseInvoice}
          saleData={invoiceData}
        />
      )}
    </div>
  );
}
