import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Price from './Price';

// Prevent multiple modal registrations
if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

export default function InvoiceModal({ isOpen, onClose, saleData }) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!saleData) return null;

  // Add the currency icon SVG as a base64 encoded string
  const currencyIconSvg = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1124.14 1256.39">
      <path fill="currentColor" d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>
      <path fill="currentColor" d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>
    </svg>
  `)}`;

  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      // Add slight delay to ensure loading state is rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Validate sale data before printing
      if (!saleData || !Array.isArray(saleData.items)) {
        console.error('Invalid sale data:', saleData);
        return;
      }

      // Ensure all required numeric values exist
      const validatedData = {
        ...saleData,
        items: saleData.items.map(item => ({
          ...item,
          unitPrice: safeNumber(item.unitPrice),
          quantity: safeNumber(item.quantity),
          discountPercentage: safeNumber(item.discountPercentage)
        })),
        subtotalBeforeDiscount: safeNumber(saleData.subtotalBeforeDiscount),
        totalDiscountAmount: safeNumber(saleData.totalDiscountAmount),
        subtotalAfterDiscount: safeNumber(saleData.subtotalAfterDiscount),
        totalVATAmount: safeNumber(saleData.totalVATAmount), // Use the passed VAT amount
        finalTotal: safeNumber(saleData.finalTotal),
        cashReceived: safeNumber(saleData.cashReceived),
        change: safeNumber(saleData.change)
      };

      const printContent = generatePrintContent(validatedData);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(printContent);
        win.document.close();
        // Wait for print window to fully load
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePrintContent = (data) => {
    const safeNumber = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    // Calculate VAT if it's not provided
    const subtotalAfterDiscount = safeNumber(data.subtotalAfterDiscount);
    const vatAmount = safeNumber(data.totalVATAmount) || subtotalAfterDiscount * 0.15;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GroceryMate - Invoice #${data.invoiceNumber}</title>
          <style>
            @page { 
              margin: 0.5cm;
              size: auto;
            }
            body { 
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .invoice-content {
              max-width: 800px;
              margin: 0 auto;
            }
            .table { 
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .table th, .table td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .text-end { text-align: right; }
            .text-center { text-align: center; }
            .mt-4 { margin-top: 1.5rem; }
            .mb-4 { margin-bottom: 1.5rem; }
            .currency-icon {
              height: 14px;
              width: auto !important;
              margin-right: 4px;
              vertical-align: middle;
              display: inline-block;
            }
            .price-container {
              display: inline-flex;
              align-items: center;
              white-space: nowrap;
            }
            .totals-section {
              margin-top: 20px;
              border-top: 2px solid #ddd;
              padding-top: 10px;
            }
            .totals-row {
              display: flex;
              justify-content: flex-end;
              margin: 5px 0;
            }
            .totals-label {
              margin-right: 20px;
              font-weight: normal;
            }
            .totals-value {
              min-width: 120px;
              text-align: right;
            }
            .text-danger { color: #dc3545; }
            .barcode-container {
              text-align: center;
              margin: 30px 0;
            }
            #barcode {
              max-width: 100%;
              height: 100px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-content">
            <h2 class="text-center">GroceryMate</h2>
            <p class="text-center mb-4">Invoice #: ${data.invoiceNumber}</p>
            <p class="text-center mb-4">Date: ${new Date().toLocaleString()}</p>
            
            <div class="barcode-container">
              <svg id="barcode"></svg>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-end">Price (incl. VAT)</th>
                  <th class="text-center">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td>${item.brand} ${item.name}</td>
                    <td class="text-end">
                      <div class="price-container">
                        <img src="${currencyIconSvg}" class="currency-icon" alt="SAR"/>
                        ${(item.unitPrice * 1.15).toFixed(2)}
                      </div>
                    </td>
                    <td class="text-center">${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="totals-row">
                <span class="totals-label">Subtotal:</span>
                <div class="price-container">
                  <img src="${currencyIconSvg}" class="currency-icon" alt="SAR"/>
                  ${data.subtotalBeforeDiscount.toFixed(2)}
                </div>
              </div>
              ${data.totalDiscountAmount > 0 ? `
                <div class="totals-row">
                  <span class="totals-label">Discount (${((data.totalDiscountAmount / data.subtotalBeforeDiscount) * 100).toFixed(1)}%):</span>
                  <div class="price-container text-danger">
                    -<img src="${currencyIconSvg}" class="currency-icon" alt="SAR"/>
                    ${data.totalDiscountAmount.toFixed(2)}
                  </div>
                </div>
              ` : ''}
              <div class="totals-row">
                <span class="totals-label">VAT (15%):</span>
                <div class="price-container">
                  <img src="${currencyIconSvg}" class="currency-icon" alt="SAR"/>
                  ${vatAmount.toFixed(2)}
                </div>
              </div>
              <div class="totals-row">
                <span class="totals-label">Final Total:</span>
                <div class="price-container">
                  <img src="${currencyIconSvg}" class="currency-icon" alt="SAR"/>
                  ${data.finalTotal.toFixed(2)}
                </div>
              </div>
              ${data.paymentMethod === 'Cash' ? `
                <div class="totals-row">
                  <span class="totals-label">Cash Received:</span>
                  <div class="price-container">
                    <img src="${currencyIconSvg}" class="currency-icon" alt="SAR"/>
                    ${data.cashReceived.toFixed(2)}
                  </div>
                </div>
                <div class="totals-row">
                  <span class="totals-label">Change:</span>
                  <div class="price-container">
                    <img src="${currencyIconSvg}" class="currency-icon" alt="SAR"/>
                    ${data.change.toFixed(2)}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <p class="text-center mt-4">Thank you for shopping with us!</p>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              if (typeof JsBarcode !== 'undefined') {
                JsBarcode("#barcode", "${data.invoiceNumber}", {
                  format: "CODE128",
                  width: 3,
                  height: 100,
                  displayValue: false,
                  fontSize: 18,
                  margin: 10
                });
              }
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={false}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="text-center p-6 rounded-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">Generating Invoice...</p>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="p-6 border-b">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">GroceryMate</h2>
          <p className="text-gray-600 mb-1">Invoice #: {saleData.invoiceNumber}</p>
          <p className="text-gray-600">Date: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="min-w-full">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 bg-gray-50">Item</th>
                <th className="text-right p-3 bg-gray-50">Price (incl. VAT)</th>
                <th className="text-center p-3 bg-gray-50">Qty</th>
              </tr>
            </thead>
            <tbody>
              {saleData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{item.brand} {item.name}</td>
                  <td className="p-3 text-right">
                    <Price amount={item.unitPrice * 1.15} />
                  </td>
                  <td className="p-3 text-center">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t bg-white p-6">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="text-right text-gray-600">Subtotal:</div>
          <div className="text-right"><Price amount={saleData.subtotalBeforeDiscount} /></div>
          
          {saleData.totalDiscountAmount > 0 && (
            <>
              <div className="text-right text-gray-600">
                Total Discount ({((saleData.totalDiscountAmount / saleData.subtotalBeforeDiscount) * 100).toFixed(1)}%):
              </div>
              <div className="text-right text-red-600">
                -<Price amount={saleData.totalDiscountAmount} />
              </div>
              
              <div className="text-right text-gray-600">Subtotal After Discount:</div>
              <div className="text-right"><Price amount={saleData.subtotalAfterDiscount} /></div>
            </>
          )}

          <div className="text-right text-gray-600">VAT (15%):</div>
          <div className="text-right"><Price amount={saleData.totalVATAmount} /></div>
          
          <div className="text-right font-bold pt-2 border-t">Final Total:</div>
          <div className="text-right font-bold pt-2 border-t">
            <Price amount={saleData.finalTotal} />
          </div>

          {saleData.paymentMethod === 'Cash' && (
            <>
              <div className="text-right text-gray-600">Cash Received:</div>
              <div className="text-right"><Price amount={saleData.cashReceived} /></div>
              
              <div className="text-right text-gray-600">Change:</div>
              <div className="text-right text-green-600"><Price amount={saleData.change} /></div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <i className="fas fa-print mr-2"></i>
            Print Invoice
          </button>
        </div>
      </div>
    </Modal>
  );
}
