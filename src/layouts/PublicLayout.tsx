import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

export default function PublicLayout() {
  return (
    <div>
      <PublicNavbar />
      <Outlet />
    </div>
  );
}
