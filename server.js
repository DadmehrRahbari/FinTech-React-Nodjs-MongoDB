require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"));

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    balance: { type: Number, default: 1000 }, // Default balance
});

const User = mongoose.model("User", UserSchema);

// User Registration
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered" });
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, balance: user.balance, name: user.name });
});

// Get Balance
app.get("/balance", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    res.json({ balance: user.balance });
});

// Transfer Money
app.post("/transfer", async (req, res) => {
    const { email, amount } = req.body;
    const senderToken = req.headers.authorization.split(" ")[1];
    const senderDecoded = jwt.verify(senderToken, process.env.JWT_SECRET);
    const sender = await User.findById(senderDecoded.userId);
    const receiver = await User.findOne({ email });

    if (!receiver || sender.balance < amount) {
        return res.status(400).json({ message: "Transaction failed" });
    }

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    res.json({ message: "Transfer successful", newBalance: sender.balance });
});

app.listen(5000, () => console.log("Server running on port 5000"));
