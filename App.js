import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [email, setEmail] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.get("http://localhost:5000/balance", { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setBalance(res.data.balance));
        }
    }, []);

    const login = async () => {
        const res = await axios.post("http://localhost:5000/login", { email, password: "test123" });
        localStorage.setItem("token", res.data.token);
        setUser(res.data.name);
        setBalance(res.data.balance);
    };

    const transfer = async () => {
        const token = localStorage.getItem("token");
        await axios.post("http://localhost:5000/transfer", { email, amount }, { headers: { Authorization: `Bearer ${token}` } });
        setBalance(balance - amount);
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            {user ? (
                <>
                    <h1 className="text-xl font-bold mb-4">Welcome, {user}</h1>
                    <p className="mb-2">Balance: ${balance}</p>
                    <input placeholder="Recipient Email" className="border p-2 w-full" onChange={e => setEmail(e.target.value)} />
                    <input placeholder="Amount" className="border p-2 w-full mt-2" onChange={e => setAmount(e.target.value)} />
                    <button className="bg-blue-500 text-white p-2 mt-2 w-full" onClick={transfer}>Send Money</button>
                </>
            ) : (
                <button className="bg-green-500 text-white p-2 w-full" onClick={login}>Login</button>
            )}
        </div>
    );
}

export default App;
