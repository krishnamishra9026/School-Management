import React, {
    createContext,
    useContext,
    useMemo,
} from "react";

import { useSelector } from "react-redux";
import { createAbility } from "./ability";

const AbilityContext =
    createContext(null);

export const AbilityProvider = ({
    children,
}) => {
    const {
        user,
        permissions = [],
        isAuthenticated,
    } = useSelector(
        (state) => state.auth
    );

    const roleSlug =
        user?.roleId?.slug || null;

    const ability = useMemo(() => {
        console.log(
            "Creating CASL ability:",
            {
                isAuthenticated,
                roleSlug,
                permissions,
            }
        );

        return createAbility(
            permissions,
            roleSlug
        );
    }, [
        isAuthenticated,
        roleSlug,
        permissions,
    ]);

    return (
        <AbilityContext.Provider
            value={ability}
        >
            {children}
        </AbilityContext.Provider>
    );
};

export const useAbility = () =>
    useContext(AbilityContext);