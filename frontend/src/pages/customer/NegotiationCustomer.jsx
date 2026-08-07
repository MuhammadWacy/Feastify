import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const fallbackCartData = [
    {
        sellerEmail: "royalcaterers@gmail.com",
        sellerName: "Royal Caterers",
        customerEmail: "customer1@gmail.com",
        date: "13-08-2026",
        items: [
            { foodName: "Chicken Biryani", image: "/images/biryani.png", pricePerServing: 550, servings: 200 },
            { foodName: "Chicken Roast", image: "/images/roast.png", pricePerServing: 350, servings: 200 },
        ],
    }
];

const NegotiationCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);

  const currentCart = location.state?.cartData || fallbackCartData[0];
  const negotiationKey = `neg_${currentCart.customerEmail}_${currentCart.sellerEmail}`;

  const [catererItems, setCatererItems] = useState(
    (currentCart.items || []).map((item, index) => ({
      id: index + 1,
      name: item.foodName || item.name,
      price: item.pricePerServing || item.originalPrice || 0,
      quantity: item.servings || item.quantity || 200,
      image: item.image || "/images/default.png",
    }))
  );

  const [selectedItemIds, setSelectedItemIds] = useState(catererItems.map(i => i.id));
  const [customPrices, setCustomPrices] = useState(
    catererItems.reduce((acc, item) => ({ ...acc, [item.id]: item.price.toString() }), {})
  );

  useEffect(() => {
    const fetchRealBackendData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/negotiations/${currentCart.customerEmail}/${currentCart.sellerEmail}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          if (data.status === 'declined') {
            setIsCancelled(true);
            setStatusMessage('This negotiation has been cancelled.');
          } else {
            if (data.deliveryLocation) setDeliveryLocation(data.deliveryLocation);
            if (data.items) {
              const prices = {};
              data.items.forEach(item => {
                prices[item.id || item.itemId] = (item.offeredPrice || item.pricePerServing || '').toString();
              });
              setCustomPrices(prices);
            }
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
          } else {
            if (parsed.deliveryLocation) setDeliveryLocation(parsed.deliveryLocation);
            if (parsed.items) {
              const prices = {};
              parsed.items.forEach(item => {
                prices[item.id] = (item.offeredPrice || item.pricePerServing || '').toString();
              });
              setCustomPrices(prices);
            }
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
        } else if (parsed.sender === 'caterer') {
          setStatusMessage('New counter-offer received from Caterer!');
          alert('The caterer has sent a counter-offer!');
          if (parsed.deliveryLocation) setDeliveryLocation(parsed.deliveryLocation);
          if (parsed.items) {
            const updatedPrices = {};
            parsed.items.forEach(item => {
              updatedPrices[item.id] = (item.offeredPrice || '').toString();
            });
            setCustomPrices(updatedPrices);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [negotiationKey, currentCart]);

  const toggleSelectItem = (id) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(itemId => itemId !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
      const item = catererItems.find(i => i.id === id);
      if (item && !customPrices[id]) {
        setCustomPrices(prev => ({ ...prev, [id]: item.price.toString() }));
      }
    }
  };

  const handlePriceChange = (id, val) => {
    setCustomPrices(prev => ({ ...prev, [id]: val }));
  };

  const totalToPaid = selectedItemIds.reduce((sum, id) => {
    const item = catererItems.find(i => i.id === id);
    const price = parseFloat(customPrices[id]) || 0;
    const qty = item ? item.quantity : 1;
    return sum + (price * qty);
  }, 0);
  
  const handleUpdateOffer = async () => {
    const payload = {
      sender: 'customer',
      status: 'active',
      customerEmail: currentCart.customerEmail,
      sellerEmail: currentCart.sellerEmail,
      sellerName: currentCart.sellerName || "Royal Caterers",
      date: currentCart.date || "13-08-2026",
      deliveryLocation,
      totalToPaid,
      items: selectedItemIds.map(id => {
        const item = catererItems.find(i => i.id === id);
        return {
          id: item.id,
          name: item.name,
          image: item.image,
          originalPrice: item.price,
          offeredPrice: parseFloat(customPrices[id]) || item.price,
          quantity: item.quantity
        };
      })
    };

    try {
      const response = await fetch('http://localhost:5000/api/negotiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setStatusMessage('Offer sent to caterer via Database!');
        alert('Offer successfully sent to the caterer via Database!');
        return;
      }
    } catch (error) {
      // Fall back to simulation
    }

    localStorage.setItem(negotiationKey, JSON.stringify(payload));
    setStatusMessage('Offer sent to caterer (Simulation Mode)!');
    alert('Offer successfully sent to the caterer (Simulation Mode)!');
  };

  const handleProceedToPayment = async () => {
    const checkoutPayload = {
      customerEmail: currentCart.customerEmail || "customer1@gmail.com",
      bookingDate: currentCart.date || "13-08-2026",
      sellerEmail: currentCart.sellerEmail || "royalcaterers@gmail.com",
      sellerName: currentCart.sellerName || "Royal Caterers",
      deliveryLocation: deliveryLocation || "Gulshan",
      totalToPaid: totalToPaid,
      items: selectedItemIds.map(id => {
        const item = catererItems.find(i => i.id === id);
        return {
          foodName: item.name,
          image: item.image,
          pricePerServing: parseFloat(customPrices[id]) || item.price,
          servings: item.quantity
        };
      })
    };

    const acceptedPayload = {
      sender: 'customer',
      status: 'accepted',
      customerEmail: currentCart.customerEmail,
      sellerEmail: currentCart.sellerEmail,
      deliveryLocation,
      totalToPaid,
      items: checkoutPayload.items.map((it, idx) => ({
        id: idx + 1,
        name: it.foodName,
        offeredPrice: it.pricePerServing,
        quantity: it.servings
      }))
    };

    try {
      await fetch('http://localhost:5000/api/negotiations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acceptedPayload),
      });
    } catch (error) {
      localStorage.setItem(negotiationKey, JSON.stringify(acceptedPayload));
    }

    navigate('/payment', { state: { checkoutData: checkoutPayload } });
  };

  const handleDecline = async () => {
    if (window.confirm('Are you sure you want to decline and cancel this negotiation?')) {
      const declinePayload = {
        sender: 'customer',
        status: 'declined',
        customerEmail: currentCart.customerEmail,
        sellerEmail: currentCart.sellerEmail
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

      {statusMessage && !isCancelled && (
        <div className="px-4">
          <div className="alert alert-info py-2 text-center fw-bold">{statusMessage}</div>
        </div>
      )}

      {isCancelled ? (
        <div className="px-4 pb-4">
          <div className="p-5 rounded shadow-sm text-center bg-light">
            <h3 className="text-danger fw-bold">Negotiation Cancelled</h3>
            <p className="text-muted">This negotiation session has been cancelled by one of the parties.</p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
              <button className="btn btn-warning fw-bold text-dark" onClick={handleResetSimulation}>🔄 Reset Simulation & Test Again</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 w-100">
          <div className="p-4 rounded shadow-sm w-100" style={{ backgroundColor: '#ff8533' }}>
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="bg-white rounded p-2 mb-3 text-center fw-bold fs-5 text-dark shadow-sm">
                  Caterer's Listing <span className="small text-muted fw-normal fs-6">(Click to select items)</span>
                </div>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }} className="pe-2">
                  {catererItems.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleSelectItem(item.id)}
                        className="bg-white rounded p-3 mb-3 shadow-sm d-flex gap-3 align-items-center position-relative"
                        style={{ cursor: 'pointer', border: isSelected ? '3px solid #198754' : '3px solid transparent' }}
                      >
                        {isSelected && <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success p-2">✓ Selected</span>}
                        <div className="rounded bg-secondary flex-shrink-0 d-flex align-items-center justify-content-center text-white" style={{ width: '90px', height: '90px' }}>
                          <span className="small">{item.image}</span>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">{item.name}</h6>
                          <p className="text-muted small mb-1">Their Offer</p>
                          <p className="mb-1 small">Per serving: {item.price} BDT</p>
                          <p className="mb-0 small">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="bg-white rounded p-2 mb-3 text-center fw-bold fs-5 text-dark shadow-sm">
                  Make your offer
                </div>
                <div className="bg-white rounded p-2 mb-3 shadow-sm d-flex align-items-center">
                  <label className="fw-bold small me-2 text-nowrap mb-0">Delivery Location:</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Enter location..."
                  />
                </div>

                <div style={{ maxHeight: '330px', overflowY: 'auto' }} className="pe-2">
                  {selectedItemIds.length === 0 ? (
                    <div className="bg-white rounded p-4 text-center text-muted shadow-sm">No items selected.</div>
                  ) : (
                    selectedItemIds.map((id) => {
                      const item = catererItems.find(i => i.id === id);
                      if (!item) return null;
                      return (
                        <div key={item.id} className="bg-white rounded p-3 mb-3 shadow-sm d-flex gap-3 align-items-center">
                          <div className="rounded bg-secondary flex-shrink-0 d-flex align-items-center justify-content-center text-white" style={{ width: '90px', height: '90px' }}>
                            <span className="small">{item.image}</span>
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
                                value={customPrices[item.id] || ''}
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                              />
                              <span className="small">BDT</span>
                            </div>
                            <p className="mb-0 small">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded p-3 mt-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center gap-4 flex-wrap">
                <div className="fw-bold small">Total to be paid: <span className="text-success fw-normal">{totalToPaid} BDT</span></div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-success fw-bold px-4 text-white" onClick={handleUpdateOffer}>Update</button>
                <button className="btn fw-bold px-4 text-white" style={{ backgroundColor: '#ff7700' }} onClick={handleProceedToPayment}>Proceed</button>
                <button className="btn btn-danger fw-bold px-4 text-white" onClick={handleDecline}>Decline</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationCustomer;