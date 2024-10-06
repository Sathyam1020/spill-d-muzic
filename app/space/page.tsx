'use client'

import { useState } from "react";

export default function CreateSpaceForm() {
  const [spaceName, setSpaceName] = useState("");
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const res = await fetch("/api/space", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ spaceName }),
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter space name"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
        />
        <button type="submit">Create Space</button>
      </form>
      {/* {response && <p>{response.message}</p>} */}
    </div>
  );
}
