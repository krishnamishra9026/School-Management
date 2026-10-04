import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/authApi";

import { studentsApi } from "../features/students/studentsApi";
import { teachersApi } from "../features/teachers/teachersApi";
import { usersApi } from "../features/users/usersApi";
import { parentsApi } from "../features/parents/parentsApi";
import { parentStudentsApi } from "../features/parentStudents/parentStudentsApi";
import { rolesApi } from "../features/roles/rolesApi";
import { permissionsApi } from "../features/permissions/permissionsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    [authApi.reducerPath]: authApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [teachersApi.reducerPath]: teachersApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [parentsApi.reducerPath]: parentsApi.reducer,
    [parentStudentsApi.reducerPath]: parentStudentsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,

    [permissionsApi.reducerPath]: permissionsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(teachersApi.middleware)
      .concat(studentsApi.middleware)
      .concat(usersApi.middleware)
      .concat(parentStudentsApi.middleware)
      .concat(rolesApi.middleware)
      .concat(permissionsApi.middleware)
      .concat(parentsApi.middleware),
});
