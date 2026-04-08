// backend/routes/itemRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getStats,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

// All item routes are protected
router.use(protect);

router.get('/stats', getStats);  // Must be before /:id

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItem)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
