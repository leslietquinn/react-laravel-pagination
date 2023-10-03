import { createContext, useState } from "react";

/* create the global state, from context */
const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
	const [auth, setAuth] = useState({});

	return (
		<AuthContext.Provider value={{auth, setAuth}}>{children}</AuthContext.Provider>
	);
};

export default AuthContext;