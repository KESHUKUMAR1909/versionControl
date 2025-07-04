const express = require('express');
const userRouter = express.Router();

// controller
const userContoller = require('../controllers/userController.js');


userRouter.get('/allUsers' , userContoller.getAllUsers);
userRouter.post('/signup' , userContoller.signup);
userRouter.post('/login' , userContoller.login);
userRouter.put('/updateProfile' , userContoller.updateUserProfile);
userRouter.get('/userProfile' , userContoller.getUserProfile);
userRouter.delete('/deleteProfile' , userContoller.deleteUserProfile);

module.exports = userRouter;