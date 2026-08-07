import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const fallbackCatererNegotiation = {
  customerEmail: 'customer1@gmail.com',
  sellerEmail: 'royalcaterers@gmail.com',
  deliveryLocation: 'Gulshan',
  items: [
    { id: 1, name: 'Chicken Biryani', originalPrice: 550, offeredPrice: 550, quantity: 200, image: 'Food Img' },
    { id: 2, name: 'Chicken Roast', originalPrice: 350, offeredPrice: 350, quantity: 200, image: 'Food Img' }
  ]
};

const NegotiationCaterer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state?.negotiationData || fallbackCatererNegotiation;
  const negotiationKey = `neg_${initialData.customerEmail}_${initialData.sellerEmail}`;

  const [customerData, setCustomerData] = useState({
    deliveryLocation: initialData.deliveryLocation || '',
    items: initialData.items || []
  });

  const [catererPrices, setCatererPrices] = useState(() => {
    const prices = {};
    (initialData.items || []).forEach(item => {
      prices[item.id] = (item.offeredPrice || item.originalPrice || '').toString();
    });
    return prices;
  });

  const [isCancelled, setIsCancelled] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchRealBackendData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/negotiations/${initialData.customerEmail}/${initialData.sellerEmail}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          if (data.status === 'declined') {
            setIsCancelled(true);
            setStatusMessage('This negotiation has been cancelled.');
          } else if (data.status === 'accepted') {
            setIsAccepted(true);
            setStatusMessage('🎉 Success! The customer has accepted and approved the offer!');
          } else {
            setCustomerData({
              deliveryLocation: data.deliveryLocation || '',
              items: data.items || []
            });
            const prices = {};
            data.items.forEach(item => {
              prices[item.id || item.itemId] = (item.offeredPrice || '').toString();
            });
            setCatererPrices(prices);
          }
          return true;
        }
      } catch (error) {
        return false;
      }
      return false;
    };

    fetchRealBackendData().then((isRealDataActive) => {
      if (!isRealDataActive) {
        const savedState = localStorage.getItem(negotiationKey);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed.status === 'declined') {
            setIsCancelled(true);
            setStatusMessage('This negotiation has been cancelled.');
          } else if (parsed.status === 'accepted') {
            setIsAccepted(true);
            setStatusMessage('🎉 Success! The customer has accepted and approved the offer!');
          } else {
            setCustomerData({
              deliveryLocation: parsed.deliveryLocation || '',
              items: parsed.items || []
            });
            const prices = {};
            parsed.items.forEach(item => {
              prices[item.id] = (item.offeredPrice || '').toString();
            });
            setCatererPrices(prices);
          }
        }
      }
    });

    const handleStorageChange = (event) => {
      if (event.key === negotiationKey && event.newValue) {
        const parsed = JSON.parse(event.newValue);
        if (parsed.status === 'declined') {
          setIsCancelled(true);
          setStatusMessage('This negotiation has been cancelled.');
          alert('Negotiation has been cancelled.');
        } else if (parsed.status === 'accepted') {
          setIsAccepted(true);
          setStatusMessage('🎉 Success! The customer has accepted and approved the offer!');
          alert('The customer has accepted and approved the offer!');
        } else if (parsed.sender === 'customer') {
          alert('The customer has updated their offer!');
          setCustomerData({
            deliveryLocation: parsed.deliveryLocation || '',
            items: parsed.items || []
          });
          const prices = {};
          parsed.items.forEach(item => {
            prices[item.id] = (item.offeredPrice || '').toString();
          });
          setCatererPrices(prices);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [negotiationKey, initialData]);

  const handlePriceChange = (itemId, val) => {
    setCatererPrices(prev => ({ ...prev, [itemId]: val }));
  };

  const handleUpdateCounterOffer = async () => {
    const totalToPaid = customerData.items.reduce((sum, item) => {
      const price = parseFloat(catererPrices[item.id]) || item.offeredPrice || 0;
      return sum + (price * item.quantity);
    }, 0);

    const counterPayload = {
      sender: 'caterer',
      status: 'active',
      customerEmail: initialData.customerEmail,
      sellerEmail: initialData.sellerEmail,
      deliveryLocation: customerData.deliveryLocation,
      totalToPaid,
      items: customerData.items.map(item => ({
        id: item.id,
        name: item.name,
        originalPrice: item.originalPrice,
        offeredPrice: parseFloat(catererPrices[item.id]) || item.offeredPrice,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/negotiations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(counterPayload),
      });
      if (response.ok) {
        alert('Counter-offer sent to customer via Database successfully!');
        return;
      }
    } catch (error) {
      // Fall back to simulation
    }

    localStorage.setItem(negotiationKey, JSON.stringify(counterPayload));
    alert('Counter-offer sent back to customer successfully (Simulation Mode)!');
  };

  const handleDecline = async () => {
    if (window.confirm('Are you sure you want to decline and cancel this negotiation?')) {
      const declinePayload = {
        sender: 'caterer',
        status: 'declined',
        customerEmail: initialData.customerEmail,
        sellerEmail: initialData.sellerEmail
      };

      try {
        await fetch('http://localhost:5000/api/negotiations/decline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(declinePayload),
        });
      } catch (error) {
        localStorage.setItem(negotiationKey, JSON.stringify(declinePayload));
      }

      setIsCancelled(true);
      setStatusMessage('You have cancelled this negotiation.');
    }
  };

  const handleResetSimulation = () => {
    localStorage.removeItem(negotiationKey);
    setIsCancelled(false);
    setIsAccepted(false);
    setStatusMessage('');
    window.location.reload();
  };

  return (
    <div className="w-100 bg-white">
      <div className="px-4 py-2 bg-white w-100">
        <button className="btn text-white fw-bold px-3 py-1" style={{ backgroundColor: '#e65c00' }} onClick={() => navigate(-1)}>
          &larr; BACK
        </button>
      </div>

      {statusMessage && (
        <div className="px-4 mb-3">
          <div className={`alert ${isCancelled ? 'alert-danger' : isAccepted ? 'alert-success' : 'alert-info'} py-2 text-center fw-bold fs-5`}>
            {statusMessage}
          </div>
        </div>
      )}

      {isCancelled ? (
        <div className="px-4 pb-4">
          <div className="p-5 rounded shadow-sm text-center bg-light">
            <h3 className="text-danger fw-bold">Negotiation Cancelled</h3>
            <p className="text-muted">This negotiation session has been cancelled.</p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
              <button className="btn btn-warning fw-bold text-dark" onClick={handleResetSimulation}>🔄 Reset Simulation & Test Again</button>
            </div>
          </div>
        </div>
      ) : isAccepted ? (
        <div className="px-4 pb-4">
          <div className="p-5 rounded shadow-sm text-center bg-light border border-success">
            <h3 className="text-success fw-bold">Offer Accepted by Customer!</h3>
            <p className="text-muted">The customer has approved the final price and proceeded to checkout.</p>
            <button className="btn btn-warning fw-bold text-dark mt-3" onClick={handleResetSimulation}>🔄 Reset Simulation & Test Again</button>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 w-100">
          <div className="p-4 rounded shadow-sm w-100" style={{ backgroundColor: '#ff8533' }}>
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="bg-white rounded p-2 mb-3 text-center fw-bold fs-5 text-dark shadow-sm">
                  Make your offer
                </div>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }} className="pe-2">
                  {customerData.items.map((item) => (
                    <div key={item.id} className="bg-white rounded p-3 mb-3 shadow-sm d-flex gap-3 align-items-center">
                      <div className="rounded bg-secondary flex-shrink-0 d-flex align-items-center justify-content-center text-white" style={{ width: '90px', height: '90px' }}>
                        <span className="small">{item.image || 'Food Img'}</span>
                      </div>
                      <div className="w-100">
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <p className="text-muted small mb-1">Your Offer</p>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="small">Per serving:</span>
                          <input 
                            type="number" 
                            className="form-control form-control-sm" 
                            style={{ width: '75px' }}
                            value={catererPrices[item.id] || ''}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          />
                          <span className="small">BDT</span>
                        </div>
                        <p className="mb-0 small">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="bg-white rounded p-2 mb-3 text-center fw-bold fs-5 text-dark shadow-sm">
                  Customer's Offer
                </div>
                <div className="bg-white rounded p-2 mb-3 shadow-sm d-flex align-items-center">
                  <label className="fw-bold small me-2 text-nowrap mb-0">Customer's Location:</label>
                  <input type="text" className="form-control form-control-sm bg-light" value={customerData.deliveryLocation} readOnly />
                </div>

                <div style={{ maxHeight: '330px', overflowY: 'auto' }} className="pe-2">
                  {customerData.items.map((item) => (
                    <div key={item.id} className="bg-white rounded p-3 mb-3 shadow-sm d-flex gap-3 align-items-center">
                      <div className="rounded bg-secondary flex-shrink-0 d-flex align-items-center justify-content-center text-white" style={{ width: '90px', height: '90px' }}>
                        <span className="small">{item.image || 'Food Img'}</span>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <p className="text-muted small mb-1">Their Offer</p>
                        <p className="mb-1 small">Per serving: {item.offeredPrice} BDT</p>
                        <p className="mb-0 small">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded p-3 mt-3 shadow-sm d-flex flex-wrap justify-content-end align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-success fw-bold px-4 text-white" onClick={handleUpdateCounterOffer}>Update</button>
                <button className="btn btn-danger fw-bold px-4 text-white" onClick={handleDecline}>Decline</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationCaterer;