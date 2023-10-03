import { useContext } from "react";
import AuthContext from "../Utils/AuthProvider";

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;