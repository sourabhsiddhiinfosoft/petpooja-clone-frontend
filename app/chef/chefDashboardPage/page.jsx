"use client";

import { useTestNotificationMutation } from "../../../store/api/ownerApi";

export default function ChefDashboardPage(){
    const [testNotification] = useTestNotificationMutation();
    
      const handleTestNotify = () => {
        const reqBody ={ toRole: 'waiter', message: 'Test from Chef' }
        testNotification(reqBody);
};
// Add button: 
    return(
        <div>
            <h1>Chef Dashboard</h1>
            <button className="bg-amber-200 text-black p-4" onClick={handleTestNotify}>Notify Waiter</button>
        </div>
    )
}