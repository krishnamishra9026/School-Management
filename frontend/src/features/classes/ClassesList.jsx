import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ClassesList = () => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get("/classes");
                setClasses(response.data);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };

        fetchClasses();
    }, []);

    return (
        <div>
            <h1>Classes</h1>
            <Link to="/classes/new" className="btn btn-primary">Add Class</Link>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map((classItem) => (
                        <tr key={classItem.id}>
                            <td>{classItem.id}</td>
                            <td>{classItem.name}</td>
                            <td>
                                <Link to={`/classes/${classItem.id}/edit`} className="btn btn-warning">Edit</Link>
                                <button className="btn btn-danger">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClassesList;