import { Navigate, useLocation } from "react-router-dom";
import { hasValidSession, setRedirectAfterLogin } from "../utils/auth";

const UserRoute = ({ children }) => {
  const location = useLocation();

  if (!hasValidSession()) {
    const redirectPath = `${location.pathname}${location.search || ""}`;
    setRedirectAfterLogin(redirectPath);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserRoute;
