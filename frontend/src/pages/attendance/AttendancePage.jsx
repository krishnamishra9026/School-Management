import React from 'react';
import { useGetAttendanceQuery } from '../../features/attendance/attendanceApi';

const AttendancePage = () => {
  const { data: attendance, isLoading, isError } = useGetAttendanceQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading attendance records.</div>;

  return (
    <div>
      <h1>Attendance Records</h1>
      <ul>
        {attendance?.data.map((record) => (
          <li key={record.id}>
            {record.student.name} - {record.status} on {new Date(record.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendancePage;