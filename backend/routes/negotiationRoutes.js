const express = require('express');
const router = express.Router();

// ==========================================
// IMPORTS: Existing and New Controller Functions
// ==========================================
const { 
  createNegotiation, 
  getNegotiationById, 
  updateNegotiation,
  getCatererNegotiationsHub,       // NEW ADDITION
  toggleNegotiations,              // NEW ADDITION
  declineAllNegotiations           // NEW ADDITION
} = require('../controllers/negotiationController');

// Route to create a new negotiation offer
router.post('/', createNegotiation);

// ==========================================
// NEW ADDITION: Caterer Negotiations Hub Routes
// ==========================================
router.get('/hub/:catererId', getCatererNegotiationsHub);
router.put('/hub/:catererId/toggle', toggleNegotiations);
router.put('/hub/:catererId/decline-all', declineAllNegotiations);

// Route to get a single negotiation by ID
router.get('/:id', getNegotiationById);

// Route to update negotiation (caterer counter-offer / status updates)
router.put('/:id', updateNegotiation);

module.exports = router;