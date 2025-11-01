"use client";

import { useState } from "react";

// This file intentionally has issues to trigger Codex reviews:
// 1. SQL injection vulnerability
// 2. Missing error handling
// 3. Unused variables
// 4. Poor security practices
// 5. Performance issues

export default function TestPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const unusedVariable = "this is never used";

  // Security issue: SQL injection vulnerability
  const handleLogin = async () => {
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    // No error handling
    const response = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    setData(result);
  };

  // Performance issue: expensive operation in render
  const expensiveCalculation = () => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    return sum;
  };

  const calculated = expensiveCalculation(); // Runs on every render!

  // Security issue: storing password in state without protection
  // Security issue: eval usage
  const dangerousFunction = (userInput) => {
    return eval(userInput); // Never use eval!
  };

  return (
    <div>
      <h1>Test Page with Issues</h1>

      {/* Missing labels for accessibility */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      {/* Storing password in plain text */}
      <input
        type="text"  {/* Should be type="password" */}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      {/* No validation before calling API */}
      <button onClick={handleLogin}>Login</button>

      {/* XSS vulnerability - rendering unescaped HTML */}
      <div dangerouslySetInnerHTML={{ __html: data }} />

      <p>Calculated: {calculated}</p>
    </div>
  );
}
