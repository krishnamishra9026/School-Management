import React from 'react';
import { useGetExamsQuery } from '../../features/exams/examsApi';

const ExamsPage = () => {
  const { data: exams, isLoading, isError } = useGetExamsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading exams.</div>;

  return (
    <div>
      <h1>Exams</h1>
      <ul>
        {exams?.data.map((exam) => (
          <li key={exam.id}>{exam.name} - {exam.subject} on {new Date(exam.date).toLocaleDateString()}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExamsPage;