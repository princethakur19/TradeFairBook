import { Navigate, useLocation } from "react-router-dom";
import { hasValidSession } from "../utils/auth";

const UserRoute = ({ children }) => {
  const location = useLocation();

  if (!hasValidSession()) {
    const redirectPath = `${location.pathname}${location.search || ""}`;
    localStorage.setItem("redirectAfterLogin", redirectPath);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserRoute;
