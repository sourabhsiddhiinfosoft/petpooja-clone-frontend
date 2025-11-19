"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { socket } from "../../../lib/socket";

export default function ChefSocketTest() {
  const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     console.log("Initializing Chef Socket...");
//     socket.on("connect", () => {
//       console.log("✅ Chef connected:", socket.id);
//       setConnected(true);
//       socket.emit("joinUser", { userId: "chef1", role: "chef" });
//     });

//     socket.on("notifyChef", (data) => {
//       console.log("🍳 Message from Waiter:", data);
//       toast.success(data.message || "Message from Waiter!");
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

  const replyToWaiter = () => {
    socket.emit("replyToWaiter", {
      waiterId: "waiter1",
      message: "Chef received your message!",
    });
  };

  const handleTestNotify = () => {
  fetch('/api/orders/test-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toRole: 'waiter', message: 'Test from Chef' }),
  });
};
// Add button: <button onClick={handleTestNotify}>Notify Waiter</button>

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">👨‍🍳 Chef Panel</h2>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <button
        onClick={replyToWaiter}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        Reply to Waiter
      </button>
      <hr />
        <p>BlackBOx</p>
         <button onClick={handleTestNotify}>Notify Waiter</button>
    </div>
  );
}
