import { useState, useEffect } from 'react';
import invoiceService from '../../services/invoiceService';
import InvoiceModal from './InvoiceModal';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState('date');
  const [currentOrder, setCurrentOrder] = useState('desc');

  useEffect(() => {
    fetchInvoices();
  }, [currentSearch, currentSort, currentOrder]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        search: currentSearch,
        sortBy: currentSort,
        sortOrder: currentOrder
      };
      const result = await invoiceService.getInvoices(params);
      setInvoices(result.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewInvoice = async (id) => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoiceById(id);
      setSelectedInvoice(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setCurrentSearch(e.target.value);
  };

  const handleSortChange = (sortBy) => {
    const order = currentSort === sortBy && currentOrder === 'asc' ? 'desc' : 'asc';
    setCurrentSort(sortBy);
    setCurrentOrder(order);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Invoices</h2>
        <div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> New Invoice
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search invoices..."
            value={currentSearch}
            onChange={handleSearchChange}
          />
          <button className="btn btn-outline-primary" onClick={fetchInvoices}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th onClick={() => handleSortChange('invoiceNumber')} style={{ cursor: 'pointer' }}>
                Invoice #
                {currentSort === 'invoiceNumber' && (currentOrder === 'asc' ? ' ▲' : ' ▼')}
              </th>
              <th onClick={() => handleSortChange('createdDate')} style={{ cursor: 'pointer' }}>
                Date
                {currentSort === 'createdDate' && (currentOrder === 'asc' ? ' ▲' : ' ▼')}
              </th>
              <th>Customer</th>
              <th className="text-end">Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.saleId}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{formatDate(invoice.createdDate)}</td>
                  <td>{invoice.customerName || 'Walk-in Customer'}</td>
                  <td className="text-end">
                    {formatCurrency(invoice.finalTotal)}
                  </td>
                  <td>
                    <span className={`badge ${invoice.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => viewInvoice(invoice.saleId)}>
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <InvoiceModal
        show={showModal}
        onClose={handleModalClose}
        invoice={selectedInvoice}
        onRefresh={fetchInvoices}
      />
    </div>
  );
}