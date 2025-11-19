"use client";
import { useState } from 'react';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import MergeTablesForm from '../../../components/MergeTablesForm';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../components/DashboardLayout';
import { useMergeTablesMutation } from '../../../store/api/ownerApi';

export default function MergeTables() {
  const { user } = useCurrentBranch();
  const [loading, setLoading] = useState(false);
  const [mergeTable] = useMergeTablesMutation()

  const handleMerge = async (data) => {
    setLoading(true);
    try {
      const response = await mergeTable(data)
      if (response.ok) {
        toast.success('Tables merged successfully!');
      } else {
        throw new Error('Merge failed');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType={"waiter"}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Merge Tables for Billing</h1>
        <MergeTablesForm onSubmit={handleMerge} loading={loading} />
      </div>
    </DashboardLayout>
  );
}