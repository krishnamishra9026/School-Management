import React from "react";
import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import { useAbility } from "../auth/AbilityProvider";

const PermissionRoute = ({
    action,
    subject,
}) => {
    const ability = useAbility();
    const location = useLocation();

    if (!ability) {
        return null;
    }

    const allowed = ability.can(
        action,
        subject
    );

    console.log(
        "PermissionRoute:",
        location.pathname,
        action,
        subject,
        allowed
    );

    if (!allowed) {
        return (
            <Navigate
                to="/dashboard"
                replace
                state={{
                    from: location.pathname,
                    reason: "permission-denied",
                }}
            />
        );
    }

    return <Outlet />;
};

export default PermissionRoute;