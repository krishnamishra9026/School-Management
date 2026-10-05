import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const AttendanceForm = () => {
    const [formData, setFormData] = useState({ date: "", status: "" });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            const fetchAttendance = async () => {
                try {
                    const response = await api.get(`/attendance/${id}`);
                    setFormData(response.data);
                } catch (error) {
                    console.error("Failed to fetch attendance record", error);
                }
            };

            fetchAttendance();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await api.put(`/attendance/${id}`, formData);
            } else {
                await api.post("/attendance", formData);
            }
            navigate("/attendance");
        } catch (error) {
            console.error("Failed to save attendance record", error);
        }
    };

    return (
        <div>
            <h1>{id ? "Edit Attendance" : "Add Attendance"}</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="">Select Status</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">
                    {id ? "Update" : "Add"}
                </button>
            </form>
        </div>
    );
};

export default AttendanceForm;