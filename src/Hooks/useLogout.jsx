import authInstance from "../Utils/Axios/AuthInstance";
import useAuth from "./useAuth";

const useLogout = () => {
    const { auth, setAuth } = useAuth();

    const logout = async () => {
        const token = auth?.token;

        setAuth({});
        try {
            // attempt to blacklist the jwt token too
            const response = await authInstance.post('/authenticate/logout', {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });
        } catch(error) {
            console.error(error);
        }
    };

    return logout;
};

export default useLogout;