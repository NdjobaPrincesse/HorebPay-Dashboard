import React, { useState } from 'react';
import './Dashboard.css';

interface Transaction {
  id: string;
  date: string;
  client: string;
  payout: string;
  recepteur: string;
  montan_t: string;
  palement: string;
  operateur: string;
  produit: string;
  statut_pxmnt: string;
  statut_txn: string;
  bonus: string;
  action: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: '1',
      date: '28/2025/07',
      client: 'T10SSOCK NBONOU',
      payout: '695851906',
      recepteur: '670574663',
      montan_t: '200',
      palement: 'CAMEROON_MTN',
      operateur: 'MORLE_TOPUP',
      produit: 'N/A',
      statut_pxmnt: 'N/A',
      statut_txn: 'N/A',
      bonus: '-',
      action: 'Print'
    },
    { 
      id: '2',
      date: '29/2025/07',
      client: 'John Doe',
      payout: '695851907',
      recepteur: '670574664',
      montan_t: '300',
      palement: 'CAMEROON_MTN',
      operateur: 'MORLE_TOPUP',
      produit: 'N/A',
      statut_pxmnt: 'Completed',
      statut_txn: 'Success',
      bonus: '10',
      action: 'Print'
    },
    { 
      id: '3',
      date: '30/2025/07',
      client: 'Jane Smith',
      payout: '695851908',
      recepteur: '670574665',
      montan_t: '500',
      palement: 'CAMEROON_MTN',
      operateur: 'MORLE_TOPUP',
      produit: 'N/A',
      statut_pxmnt: 'Pending',
      statut_txn: 'Processing',
      bonus: '15',
      action: 'Print'
    },
  ]);
  
  const [filterText, setFilterText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats data
  const stats = {
    users: 88,
    transactions: 492,
    earnings: 145480
  };

  // Filter transactions based on input
  const filteredTransactions = transactions.filter(transaction =>
    transaction.client.toLowerCase().includes(filterText.toLowerCase()) ||
    transaction.payout.toLowerCase().includes(filterText.toLowerCase()) ||
    transaction.recepteur.toLowerCase().includes(filterText.toLowerCase()) ||
    transaction.montan_t.toLowerCase().includes(filterText.toLowerCase()) ||
    transaction.statut_pxmnt.toLowerCase().includes(filterText.toLowerCase()) ||
    transaction.statut_txn.toLowerCase().includes(filterText.toLowerCase())
  );

  // Handle actualize (refresh) action
  const handleActualize = () => {
    setIsRefreshing(true);

    // Simulate API refresh delay
    setTimeout(() => {
      const newTransaction: Transaction = {
        id: `${transactions.length + 1}`,
        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '/2025/'),
        client: `New Client ${transactions.length + 1}`,
        payout: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        recepteur: `${Math.floor(100000000 + Math.random() * 900000000)}`,
        montan_t: `${Math.floor(Math.random() * 1000) + 100}`,
        palement: 'CAMEROON_MTN',
        operateur: 'MORLE_TOPUP',
        produit: 'N/A',
        statut_pxmnt: Math.random() > 0.5 ? 'Completed' : 'Pending',
        statut_txn: Math.random() > 0.5 ? 'Success' : 'Processing',
        bonus: Math.random() > 0.5 ? '10' : '-',
        action: 'Print'
      };

      // Safely update list
      setTransactions(prev => [newTransaction, ...prev]);

      // Stop spinning animation
      setIsRefreshing(false);
    }, 1200);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'status-badge completed';
      case 'Success': return 'status-badge completed';
      case 'Pending': return 'status-badge pending';
      case 'Processing': return 'status-badge pending';
      case 'Failed': return 'status-badge failed';
      default: return 'status-badge';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <h1 className="dashboard-title">HOREB</h1>
      <div className="horizontal-line"></div><br/>
      
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon users-icon">
              <svg width="70%" height="70%" viewBox="0 0 24 24" fill="none">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="stat-number" style={{marginRight: '18rem', marginTop: '-0.2rem'}}>{stats.users}</span>
          </div>
          <h3 className="stat-title" style={{ marginTop: '-2.8rem', marginLeft: '-14rem'}}>USERS</h3><br/><br/>
          <div className="stat-footer" style={{backgroundColor: 'blue'}} >Total number of users</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon transactions-icon">
              <svg width="70%" height="70%" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div><br/><br/>
            <span className="stat-number" style={{marginRight: '16rem', marginTop: '-0.2rem'}}>{stats.transactions}</span>
          </div>
          <h3 className="stat-title" style={{ marginTop: '-2.8rem', marginLeft: '-8rem'}}>TRANSACTIONS</h3><br/><br/>
          <div className="stat-footer" style={{backgroundColor: 'orange'}} >Total amount received</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon earnings-icon">
              <svg width="65%" height="65%" viewBox="0 0 24 24" fill="none">
                <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="stat-number" style={{marginRight: '7.5rem'}}>{formatCurrency(stats.earnings)}</span>
          </div>
          <h3 className="stat-title" style={{ marginTop: '-2.8rem', marginLeft: '-9rem'}}>ALL EARNINGS</h3><br/><br/>
          <div className="stat-footer" style={{backgroundColor: 'green'}} >Total amount received</div>
        </div>
      </div><br/>

      {/* Transactions Section */}
      <div className="transactions-section">
        <div className="section-header">
          <h2 className="section-title">Transactions</h2>
          
          <div className="section-controls">
            <div className="search-container">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Filter by name, status, ID..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            
            <button
              className="actualize-button"
              style={{marginLeft: '-10rem', marginTop: '4.5rem'}}
              onClick={handleActualize}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <svg className="refresh-icon spinning" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1113 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1113 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Actualize
                </>
              )}
            </button>
          </div>
        </div>
      </div><br/><br/>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Payout</th>
              <th>Recepteur</th>
              <th>Montan_t</th>
              <th>Palement</th>
              <th>Opérateur</th>
              <th>Produit</th>
              <th>Statut Pxmnt</th>
              <th>Statut TXN</th>
              <th>Bonus</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="transaction-date">{transaction.date}</td>
                <td className="transaction-client">{transaction.client}</td>
                <td className="transaction-payout">{transaction.payout}</td>
                <td className="transaction-recepteur">{transaction.recepteur}</td>
                <td className="transaction-montan_t">{transaction.montan_t}</td>
                <td className="transaction-palement">{transaction.palement}</td>
                <td className="transaction-operateur">{transaction.operateur}</td>
                <td className="transaction-produit">{transaction.produit}</td>
                <td className="transaction-statut-pxmnt">
                  <span className={getStatusClass(transaction.statut_pxmnt)}>
                    {transaction.statut_pxmnt}
                  </span>
                </td>
                <td className="transaction-statut-txn">
                  <span className={getStatusClass(transaction.statut_txn)}>
                    {transaction.statut_txn}
                  </span>
                </td>
                <td className="transaction-bonus">{transaction.bonus}</td>
                <td className="transaction-action">
                  <button className="print-button" onClick={() => window.print()}>
                    {transaction.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTransactions.length === 0 && (
          <div className="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No transactions found matching your filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
