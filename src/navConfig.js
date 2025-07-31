import { ROUTES } from './routes';

export const sidebarNav = [
  { label: 'Dashboard', icon: '📊', path: ROUTES.dashboard },
  { label: 'Inventory', icon: '📦', path: ROUTES.inventory },
  { label: 'Reports', icon: '📈', path: ROUTES.reportsSales },
  { label: 'Purchasing', icon: '🛒', path: ROUTES.purchaseOrders },
  { label: 'Manage', icon: '⚙️', path: ROUTES.manageUsers }
];
