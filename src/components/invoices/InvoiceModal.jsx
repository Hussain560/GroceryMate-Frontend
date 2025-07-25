import { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';

export default function InvoiceModal({ invoice, onClose }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (invoice?.invoiceNumber && barcodeRef.current) {
      JsBarcode(barcodeRef.current, invoice.invoiceNumber, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true
      });
    }
  }, [invoice]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoice.invoiceNumber}</title>
          <link href="/css/print.css" rel="stylesheet">
        </head>
        <body>
          ${document.getElementById('invoiceContent').innerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Invoice #{invoice.invoiceNumber}</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div id="invoiceContent" className="p-4">
            {/* Invoice Header */}
            <div className="text-center mb-4">
              <h2>GroceryMate</h2>
              <p>Invoice #: {invoice.invoiceNumber}</p>
              <p>Date: {new Date(invoice.createdDate).toLocaleString()}</p>
              <svg ref={barcodeRef} className="d-block mx-auto mb-4"></svg>
            </div>

            {/* Invoice Items */}
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-end">Price</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* ...invoice totals... */}
              </tfoot>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <i className="fas fa-print"></i> Print Invoice
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
