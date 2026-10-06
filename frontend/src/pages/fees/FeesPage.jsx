import React from 'react';
import { useGetFeesQuery } from '../../features/fees/feesApi';

const FeesPage = () => {
  const { data: fees, isLoading, isError } = useGetFeesQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading fees.</div>;

  return (
    <div>
      <h1>Fees</h1>
      <ul>
        {fees?.data.map((fee) => (
          <li key={fee.id}>{fee.name}: ${fee.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default FeesPage;