const express = require('express');
const router = express.Router();
const { createReservation ,updateReservation, deleteReservation,allusers} = require('../controllers/userController');


router.delete('/delete/:slotID', deleteReservation);
router.put('/update', updateReservation);
router.post('/create', createReservation);
router.get('/getall',allusers)


module.exports = router;
