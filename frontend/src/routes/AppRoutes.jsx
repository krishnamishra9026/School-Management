import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Users
import Users from "../pages/users/Users";
import UserCreate from "../pages/users/UserCreate";
import UserView from "../pages/users/UserView";
import UserEdit from "../pages/users/UserEdit";

// Students
import Students from "../pages/students/Students";
import StudentCreate from "../pages/students/StudentCreate";
import StudentView from "../pages/students/StudentView";
import StudentEdit from "../pages/students/StudentEdit";

import ParentStudents from "../pages/parentStudents/ParentStudents";
import ParentStudentCreate from "../pages/parentStudents/ParentStudentCreate";
import ParentStudentEdit from "../pages/parentStudents/ParentStudentEdit";

// Teachers
import Teachers from "../pages/teachers/Teachers";
import TeacherCreate from "../pages/teachers/TeacherCreate";
import TeacherView from "../pages/teachers/TeacherView";
import TeacherEdit from "../pages/teachers/TeacherEdit";

import Parents from "../pages/parents/Parents";
import ParentCreate from "../pages/parents/ParentCreate";
import ParentView from "../pages/parents/ParentView";
import ParentEdit from "../pages/parents/ParentEdit";

import Roles from "../pages/roles/Roles";
import RoleForm from "../pages/roles/RoleForm";
import RolePermissions from "../pages/roles/RolePermissions";
import PermissionRoute from "./PermissionRoute";

import Classes from "../pages/classes/Classes";
import Attendance from "../pages/attendance/AttendanceList";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Users */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["super_admin", "school_admin"]} />
            }
          >
            <Route path="/users" element={<Users />} />

            <Route path="/users/create" element={<UserCreate />} />

            <Route path="/users/:id" element={<UserView />} />

            <Route path="/users/:id/edit" element={<UserEdit />} />
          </Route>

          {/* Future modules */}

          <Route path="students" element={<Students />} />

          <Route path="students/create" element={<StudentCreate />} />

          <Route path="students/:id" element={<StudentView />} />

          <Route path="students/:id/edit" element={<StudentEdit />} />

          <Route path="teachers" element={<Teachers />} />

          <Route path="teachers/create" element={<TeacherCreate />} />

          <Route path="teachers/:id" element={<TeacherView />} />

          <Route path="teachers/:id/edit" element={<TeacherEdit />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={["super_admin", "school_admin"]} />
            }
          >
            <Route path="/parents" element={<Parents />} />

            <Route path="/parents/create" element={<ParentCreate />} />

            <Route path="/parents/:id" element={<ParentView />} />

            <Route path="/parents/:id/edit" element={<ParentEdit />} />
          </Route>

          <Route path="/roles" element={<Roles />} />

          <Route
            path="/roles/create"
            element={<PermissionRoute action="create" subject="roles" />}
          >
            <Route index element={<RoleForm />} />
          </Route>

          <Route path="/roles/:id/edit" element={<RoleForm />} />

          <Route
            path="/roles/:roleId/permissions"
            element={<RolePermissions />}
          />

          <Route
            element={
              <ProtectedRoute allowedRoles={["super_admin", "school_admin"]} />
            }
          >
            <Route path="/parent-students" element={<ParentStudents />} />

            <Route
              path="/parent-students/create"
              element={<ParentStudentCreate />}
            />

            <Route
              path="/parent-students/:id/edit"
              element={<ParentStudentEdit />}
            />
          </Route>

          <Route
            path="/classes"
            element={<PermissionRoute action="view" subject="classes" />}
          >
            <Route index element={<Classes />} />
          </Route>

          <Route
            path="/attendance"
            element={<PermissionRoute action="view" subject="attendance" />}
          >
            <Route index element={<Attendance />} />
          </Route>

          <Route
            path="/fees"
            element={
              <div className="container-fluid p-4">
                <h4>Fees</h4>
              </div>
            }
          />

          <Route
            path="/exams"
            element={
              <div className="container-fluid p-4">
                <h4>Exams</h4>
              </div>
            }
          />

          <Route
            path="/library"
            element={
              <div className="container-fluid p-4">
                <h4>Library</h4>
              </div>
            }
          />

          <Route index element={<Roles />} />

          <Route
            path="/settings"
            element={
              <div className="container-fluid p-4">
                <h4>Settings</h4>
              </div>
            }
          />
        </Route>
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
