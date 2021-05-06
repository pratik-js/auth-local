const pick = require('lodash.pick');
const jwt = require('jsonwebtoken');

const jsonDb = require('../../db');


const { authenticateJWT } = require('../../middleware/authenticate');
const router = require('express').Router();

const accessTokenSecret = process.env.secret || 'poiuy';

function getUserByEmail(email) {
    return jsonDb.get('users').find(u => { return u.email === email });
}

function checkExistingUser(req, res, next) {
    const isExistingUser = getUserByEmail(req.body.email).value();
    if(isExistingUser) {
        res.send({isExistingUser: !!isExistingUser});
    }else {
        next();
    }
}

function checkEmailAvailable(req, res, next) {
    const isExistingUser = getUserByEmail(req.body.email).value();
    if(!isExistingUser) {
        res.send({isAvailable: !!isExistingUser});
    }else {
        next();
    }
}

// get all user
router.get('/users', (req, res) => {
    res.send(jsonDb.get('users').value());
});

// create users
router.post('/users',checkExistingUser, (req, res) => {
    const userData = pick(req.body, ['email', 'password', 'firstName', 'lastName', 'pincode']);
    // Add a user
    try {
        jsonDb.get('users')
            .push({ ...userData })
            .write();
        res.send({ userData, success: true, action:'user created' });
    } catch (error) {
        res.status(500).send({ error });
    }
});


// update user
router.patch('/users', authenticateJWT, (req, res) => {
    const userData = pick(req.body, ['firstName', 'lastName', 'pincode']);
    const { email } = req.tokenData; // data from JWT
    const user = getUserByEmail(email); // first time reset or match password with db
    user.assign(userData).write();
    res.send({ user: user.value(), success: true, action: 'User updated' });
});

// create Mobile app user by admin
router.post('/users/byAdmin', checkExistingUser, (req, res) => {
    const userData = pick(req.body, ['email', 'password', 'firstName', 'lastName', 'pincode', 'deviceIds']);
    // Add a user by Admin
    try {
        jsonDb.get('users')
            .push({ ...userData, isNew: true })
            .write();
        res.send({ userData, 'createdByAdmin': true, success: true });
    } catch (error) {
        console.log(error);
    }
});

router.get('/users/me', authenticateJWT, (req, res) => {
    const { email } = req.tokenData;
    // Filter user from the users array by email
    const user = getUserByEmail(email).value();
    res.send({ user, success: true });
});

// login
router.post('/login', (req, res) => {
    // Read email and password from request body
    const { email, password } = req.body;
    // Filter user from the users array by email and password
    const user = jsonDb.get('users').find(u => { return u.email === email && u.password === password }).value()

    if (user) {
        // Generate an access token
        const accessToken = jwt.sign({ email: user.email, isNew: user.isNew }, accessTokenSecret);
        res.json({
            success: true,
            accessToken,
            isNew: user.isNew
        });
    } else {
        res.send({incorrectCredentials: true, action: "incorrect Credential"});
    }
});

// forgot password
router.post('/users/forgotPassword', checkEmailAvailable, (req, res) => {
    const { email } = req.body;
    const user = getUserByEmail(email);
    user.assign({ emailOTP: 123456 , success: true})
        .write();
    res.send({ emailOTP: 123456, success: true, action: 'OTP has been sent. Please check your mail.' });
});

// after forgot password
router.post('/users/resetPassword', (req, res) => {
    const { email, emailOTP, password } = req.body;
    const user = jsonDb.get('users').find(u => { return u.email === email && u.emailOTP === emailOTP });
    if (user.value()) {
        user.assign({ password }).unset('emailOTP')
            .write();
        res.send({ success: true, action: 'Password successfully reset' });
    } else {
        res.send({ incorrectOtp: true, action: 'Please enter correct OTP' });
    }
});

router.post('/users/changePassword', authenticateJWT, (req, res) => {
    const { password, newPassword } = req.body; // will not get password when forcefully password change after first time login
    const { tokenData } = req; // data from JWT

    const user = jsonDb.get('users').find(u => { return u.email === tokenData.email && (u.isNew || u.password === password) }); // first time reset or match password with db
    console.log(user.value(), "--",  tokenData.email );
    if (user.value()) {
        user.assign({ password: newPassword }).unset('isNew').write();
        res.send({ user: user.value(), success: true, action: 'Password updated' });
    } else {
        res.send({ wrongPassword:true, action: 'Old Password is wrong' });
    }
});


module.exports = router;