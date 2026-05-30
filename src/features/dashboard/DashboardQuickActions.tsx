import { useNavigate } from 'react-router-dom';
import './DashboardQuickActions.css';

export default function DashboardQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-quick-actions">
      <button className="dashboard-quick-actions__btn" onClick={() => navigate('/transactions')}>
        <span className="dashboard-quick-actions__icon">💳</span>
        <span>Lägg till köp</span>
      </button>
      <button className="dashboard-quick-actions__btn" onClick={() => navigate('/incomes')}>
        <span className="dashboard-quick-actions__icon">💰</span>
        <span>Lägg till inkomst</span>
      </button>
      <button className="dashboard-quick-actions__btn" onClick={() => navigate('/bills')}>
        <span className="dashboard-quick-actions__icon">📄</span>
        <span>Lägg till räkning</span>
      </button>
      <button className="dashboard-quick-actions__btn" onClick={() => navigate('/transactions')}>
        <span className="dashboard-quick-actions__icon">⚖️</span>
        <span>Justera saldo</span>
      </button>
      <button className="dashboard-quick-actions__btn" onClick={() => navigate('/month-planning')}>
        <span className="dashboard-quick-actions__icon">📅</span>
        <span>Ny månad</span>
      </button>
      <button className="dashboard-quick-actions__btn" onClick={() => navigate('/insights')}>
        <span className="dashboard-quick-actions__icon">💡</span>
        <span>Insikter</span>
      </button>
    </div>
  );
}
