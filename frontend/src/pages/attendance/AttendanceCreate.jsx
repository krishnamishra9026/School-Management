import React, { useState } from "react";
import api from "../../services/api";

const AttendanceCreate = () => {
    const [date, setDate] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/attendance", { date });
            alert("Attendance record created successfully!");
        } catch (error) {
            console.error("Failed to create attendance record", error);
            alert("Failed to create attendance record.");
        }
    };

    return (
        <div>
            <h1>Create Attendance</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default AttendanceCreate;