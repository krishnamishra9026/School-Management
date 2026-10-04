import { createSlice } from "@reduxjs/toolkit";

const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
const storedPermissions =
    localStorage.getItem("permissions");

let parsedUser = null;
let parsedPermissions = [];

try {
    parsedUser = storedUser
        ? JSON.parse(storedUser)
        : null;
} catch (error) {
    parsedUser = null;
}

try {
    parsedPermissions = storedPermissions
        ? JSON.parse(storedPermissions)
        : [];
} catch (error) {
    parsedPermissions = [];
}

const initialState = {
    user: parsedUser,
    token: storedToken || null,
    permissions: Array.isArray(parsedPermissions)
        ? parsedPermissions
        : [],
    isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        setCredentials: (state, action) => {
            const {
                token,
                user,
                permissions = [],
            } = action.payload;

            state.token = token;
            state.user = user;
            state.permissions = Array.isArray(
                permissions
            )
                ? permissions
                : [];
            state.isAuthenticated = true;

            // Store authentication data
            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "permissions",
                JSON.stringify(
                    state.permissions
                )
            );
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.permissions = [];
            state.isAuthenticated = false;

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem(
                "permissions"
            );
        },
    },
});

export const {
    setCredentials,
    logout,
} = authSlice.actions;

export default authSlice.reducer;