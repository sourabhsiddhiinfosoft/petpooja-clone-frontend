// pages/support/tickets/[id].js
"use client";
import { useParams } from "next/navigation";
import { useCurrentBranch } from "../../../../../store/hooks/useCurrentBranch";
import DashboardLayout from "../../../../../components/DashboardLayout";
import TicketThread from "../../../../../components/TicketThread";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user } = useCurrentBranch();

  return (
    <DashboardLayout userType={user?.role}>
      <div className="space-y-6">
        <TicketThread ticketId={id} user={user} />
      </div>
    </DashboardLayout>
  );
}