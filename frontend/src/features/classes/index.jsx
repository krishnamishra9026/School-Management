import React from "react";
import { useNavigate } from "react-router-dom";

const Classes = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Classes</h1>
            <button onClick={() => navigate("/classes/new")}>Add New Class</button>
        </div>
    );
};

export default Classes;