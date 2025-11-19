"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { socket } from "../../../lib/socket";

export default function WaiterSocketTest() {
  const [connected, setConnected] = useState(false);

  // useEffect(() => {
  //   console.log("Initializing waiter Socket...",socket);

  //   socket.on("connect", () => {
  //     console.log("✅ Waiter connected:", socket.id);
  //     setConnected(true);
  //     socket.emit("joinUser", { userId: "waiter1", role: "waiter" });
  //   });

  //   socket.on("notifyWaiter", (data) => {
  //     console.log("📩 Message from Chef:", data);
  //     toast.success(data.message || "Message from Chef!");
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  const sendToChef = () => {
    socket.emit("testMessageToChef", {
      sender: "waiter1",
      message: "New order ready for preparation!",
    });
  };

  const handleTestNotify = () => {
  fetch('/api/orders/test-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toRole: 'chef', message: 'Test from Waiter' }),
  });
};
// Add button: <button onClick={handleTestNotify}>Notify Chef</button>

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">🍽️ Waiter Panel</h2>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <button
        onClick={sendToChef}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Send Test Message to Chef
      </button>
      <br />
      <hr />
      <p>BlackBOx</p>
       <button onClick={handleTestNotify}>Notify Chef</button>
    </div>
  );
}
