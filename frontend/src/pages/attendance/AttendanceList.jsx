import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const AttendanceList = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await api.get("/attendance");
                setAttendanceRecords(response.data);
            } catch (error) {
                console.error("Failed to fetch attendance records", error);
            }
        };

        fetchAttendance();
    }, []);

    return (
        <div>
            <h1>Attendance Records</h1>
            <Link to="/attendance/new" className="btn btn-primary">Add Attendance</Link>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceRecords.map((record) => (
                        <tr key={record.id}>
                            <td>{record.id}</td>
                            <td>{record.date}</td>
                            <td>
                                <Link to={`/attendance/${record.id}/edit`} className="btn btn-warning">Edit</Link>
                                <button className="btn btn-danger">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceList;