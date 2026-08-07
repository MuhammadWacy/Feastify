import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerNegotiationHub = () => {
  const navigate = useNavigate();
  const sellerEmail = "royalcaterers@gmail.com"; // Current logged-in seller email

  const initialNegotiations = [
    {
      customerEmail: "customer1@gmail.com",
      sellerEmail: "royalcaterers@gmail.com",
      deliveryLocation: "Gulshan",
      status: "active",
      totalToPaid: 180000,
      items: [
        { id: 1, name: 'Chicken Biryani', originalPrice: 550, offeredPrice: 500, quantity: 200, image: 'Food Img' },
        { id: 2, name: 'Chicken Roast', originalPrice: 350, offeredPrice: 350, quantity: 200, image: 'Food Img' }
      ]
    },
    {
      customerEmail: "customer2@gmail.com",
      sellerEmail: "royalcaterers@gmail.com",
      deliveryLocation: "Banani",
      status: "active",
      totalToPaid: 95000,
      items: [
        { id: 1, name: 'Chicken Biryani', originalPrice: 550, offeredPrice: 530, quantity: 100, image: 'Food Img' }
      ]
    }
  ];

  const [negotiations, setNegotiations] = useState(initialNegotiations);
  const [negotiationsEnabled, setNegotiationsEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Load negotiations and toggle state from localStorage or backend
  useEffect(() => {
    const savedToggle = localStorage.getItem(`neg_toggle_${sellerEmail}`);
    if (savedToggle !== null) {
      setNegotiationsEnabled(JSON.parse(savedToggle));
    }

    // Load active negotiations from localStorage matching this seller
    const loadedNegotiations = initialNegotiations.map(neg => {
      const key = `neg_${neg.customerEmail}_${neg.sellerEmail}`;
      const savedState = localStorage.getItem(key);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return { ...neg, ...parsed };
      }
      return neg;
    });

    setNegotiations(loadedNegotiations);

    // Cross-tab sync listener
    const handleStorageChange = (event) => {
      if (event.key && (event.key.startsWith(`neg_${sellerEmail}`) || event.key === `neg_toggle_${sellerEmail}`)) {
        if (event.key === `neg_toggle_${sellerEmail}` && event.newValue !== null) {
          setNegotiationsEnabled(JSON.parse(event.newValue));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sellerEmail]);

  // Toggle negotiations feature on/off
  const handleToggleNegotiations = () => {
    const newState = !negotiationsEnabled;
    setNegotiationsEnabled(newState);
    localStorage.setItem(`neg_toggle_${sellerEmail}`, JSON.stringify(newState));
    setStatusMessage(newState ? 'Negotiations enabled successfully.' : 'Negotiations have been turned off.');
  };

  // Bulk decline all requests
  const handleDeclineAll = () => {
    if (window.confirm('Are you sure you want to decline and cancel ALL negotiation requests?')) {
      const updated = negotiations.map(neg => {
        const declinePayload = {
          sender: 'caterer',
          status: 'declined',
          customerEmail: neg.customerEmail,
          sellerEmail: neg.sellerEmail
        };
        localStorage.setItem(`neg_${neg.customerEmail}_${neg.sellerEmail}`, JSON.stringify(declinePayload));
        return { ...neg, status: 'declined' };
      });
      setNegotiations(updated);
      setStatusMessage('All negotiation requests have been declined.');
      alert('All negotiation requests have been declined.');
    }
  };

  // Reset simulation state so you can test again
  const handleResetSimulation = () => {
    negotiations.forEach(neg => {
      localStorage.removeItem(`neg_${neg.customerEmail}_${neg.sellerEmail}`);
    });
    localStorage.removeItem(`neg_toggle_${sellerEmail}`);
    setNegotiations(initialNegotiations);
    setNegotiationsEnabled(true);
    setStatusMessage('Simulation reset successfully!');
    window.location.reload();
  };

  // Navigate to specific negotiation management view
  const handleSelectNegotiation = (neg) => {
    navigate('/caterer-negotiate', { state: { negotiationData: neg } });
  };

  const hasDeclinedAll = negotiations.every(neg => neg.status === 'declined');

  return (
    <div className="w-100 bg-white min-vh-100 pb-5">
      <div className="px-4 py-2 bg-white w-100 d-flex justify-content-between align-items-center border-bottom">
        <button 
          className="btn text-white fw-bold px-3 py-1" 
          style={{ backgroundColor: '#e65c00' }}
          onClick={() => navigate(-1)}
        >
          &larr; BACK
        </button>
        <h4 className="fw-bold mb-0 text-dark">Seller Negotiation Hub</h4>
      </div>

      {statusMessage && (
        <div className="px-4 mt-3">
          <div className="alert alert-info py-2 text-center fw-bold">{statusMessage}</div>
        </div>
      )}

      <div className="container py-4">
        {/* Hub Controls Card */}
        <div className="card shadow-sm p-4 mb-4 border-0" style={{ backgroundColor: '#fff3e6' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h5 className="fw-bold mb-1">Negotiation Management</h5>
              <p className="text-muted small mb-0">Control incoming customer negotiation requests and availability.</p>
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="form-check form-switch fs-5">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="negotiationToggle"
                  checked={negotiationsEnabled}
                  onChange={handleToggleNegotiations}
                  style={{ cursor: 'pointer' }}
                />
                <label className="form-check-label small fw-bold text-dark ms-2" htmlFor="negotiationToggle" style={{ cursor: 'pointer' }}>
                  {negotiationsEnabled ? 'Negotiations Active' : 'Negotiations Turned Off'}
                </label>
              </div>

              <button 
                className="btn btn-danger fw-bold btn-sm px-3 text-white"
                onClick={handleDeclineAll}
              >
                Decline All Requests
              </button>

              <button 
                className="btn btn-warning fw-bold btn-sm px-3 text-dark"
                onClick={handleResetSimulation}
              >
                🔄 Reset Simulation
              </button>
            </div>
          </div>
        </div>

        {/* Incoming & Existing Requests Section */}
        <h5 className="fw-bold mb-3 text-dark">Incoming & Existing Negotiation Requests</h5>

        {!negotiationsEnabled ? (
          <div className="alert alert-warning text-center p-4 rounded shadow-sm">
            <h5 className="fw-bold mb-1">Negotiations are currently turned off.</h5>
            <p className="text-muted small mb-0">Turn on negotiations above to view and respond to customer requests.</p>
          </div>
        ) : hasDeclinedAll ? (
          <div className="alert alert-light text-center p-5 rounded shadow-sm border">
            <h5 className="text-danger fw-bold">All requests have been declined.</h5>
            <p className="text-muted mb-3">You can reset the simulation at any time to test the process again.</p>
            <button className="btn btn-warning fw-bold text-dark px-4 py-2" onClick={handleResetSimulation}>
              🔄 Reset Simulation & Test Again
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {negotiations.map((neg, index) => {
              if (neg.status === 'declined') return null;
              return (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="card shadow-sm h-100 border-0" style={{ borderTop: '4px solid #ff8533' }}>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-secondary">{neg.customerEmail}</span>
                          <span className={`badge ${neg.status === 'accepted' ? 'bg-success' : 'bg-primary'}`}>
                            {neg.status === 'accepted' ? 'Accepted' : 'Active'}
                          </span>
                        </div>
                        <h6 className="fw-bold text-dark mb-2">Location: {neg.deliveryLocation}</h6>
                        <hr className="my-2" />
                        <p className="small text-muted mb-1">Items Requested:</p>
                        <ul className="list-unstyled small mb-3">
                          {neg.items.map((item, idx) => (
                            <li key={idx} className="d-flex justify-content-between">
                              <span>{item.name} (x{item.quantity})</span>
                              <span className="fw-bold">{item.offeredPrice || item.pricePerServing} BDT</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="small fw-bold text-muted">Total:</span>
                          <span className="fw-bold text-success fs-6">{neg.totalToPaid || 0} BDT</span>
                        </div>
                        <button 
                          className="btn w-100 text-white fw-bold py-2"
                          style={{ backgroundColor: '#ff7700' }}
                          onClick={() => handleSelectNegotiation(neg)}
                        >
                          Manage Negotiation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerNegotiationHub;