import api from '../api/api';

const invoiceService = {
  async getInvoices(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/invoices?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getInvoiceById(id) {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async scanInvoice(barcode) {
    try {
      const response = await api.post('/invoices/scan', barcode, {
        headers: { 'Content-Type': 'text/plain' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default invoiceService;
