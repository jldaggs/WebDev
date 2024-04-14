const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../../../WebDev/421/models/User'); 

const register = async (req, res) => {
    const user = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
    try {
        const savedUser = await user.save();
        res.status(201).send({ message: "User created successfully", userId: savedUser._id });
    } catch (error) {
        if (error.message.includes('Email already exists')) {
            res.status(409).send({ message: error.message });
        } else {
            res.status(500).send({ message: "Registration: An error occurred" });
        }
    }
};

const login = async (req, res) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Invalid credentials" });
        }

        // Generate a token
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).send({ message: "Login successful", token });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = { register, login };