import { useEffect } from "react";
import authInstance from "./Axios/AuthInstance";
import useAuth from "../Hooks/useAuth";
import axios from "axios";

/**
 * @note    the access token expires after 1 minute, which it is refreshed and returned in the response, from 
 *          the laravel server, and the refresh token expires after 10 minutes, requiring authentication once 
 *          more, ie login from user
 * 
 *          the laravel server and routes are set up and authentication controller all working as expected, no
 *          faults or behaviour not expected
 * 
 *          only issue is to destroy the state once 401 Unauthorized is returned to the client, after the refresh 
 *          token has expired, ie 10 minutes, so rerendering will result in the login screen
 */

const AxiosProvider = ({ children }) => {
    const { auth, setAuth } = useAuth();

    useEffect(() => {
        const requestInterceptor = authInstance.interceptors.request.use(
            config => {
                // setting this prevents a 401 on response
                config.headers["Authorization"] = "Bearer " + auth?.token;

                return config;
            }, (error) => {
                return Promise.reject(error);
            }
        );

        const responseInterceptor = authInstance.interceptors.response.use(
            async (response) => { 
                return response;
            }, async (error) => {
                if(error?.response?.status !== 401) {
                    // nothing to do here, so ignore the error
                    return Promise.reject(error);
                }

                const prevRequest = error.config;
                if(!prevRequest.sent) {
                    prevRequest.sent = true;

                    // do not use this instance of axios, but create a separate 
                    // instance, instead preventing an infinite loop
                    const refreshTokenInstance = axios.create({
                        baseURL: "http://somethinguseful.com/api/v1",
                        timeout: 0,
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8",
                            "Accept": "application/json; charset=UTF-8",
                            "Referrer-Policy": "strict-origin-when-cross-origin",
                            "Cache-Control": "no-cache",
                            "Authorization": "Bearer " + auth?.token
                        },
                        withCredentials: true,
                        responseType: "json",
                        responseEncoding: "utf8",
                    });

                    try {
                        // get a new token
                        const refreshResponse = await refreshTokenInstance.post("/authenticate/refresh");

                        if(refreshResponse?.status === 200) {
                            const refreshToken = refreshResponse?.data?.token;

                            setAuth(prev => {
                                return { ...prev, token: refreshToken }
                            });

                            // set up the header accordingly, for any subsequent request
                            prevRequest.headers["Authorization"] = "Bearer " + refreshToken;

                            // exit, carrying the config forward for the next request around
                            return authInstance(prevRequest);
                        }
                    } catch(error) {
                        // the refresh token has now expired, so destroy the state
                        setAuth({
                            token: null
                        });
                    }

                    return Promise.reject(error);
                } 

                return Promise.reject(error);
            }
        );

        return () => { 
            authInstance.interceptors.response.eject(responseInterceptor);
            authInstance.interceptors.request.eject(requestInterceptor);
        };
    }, [auth, setAuth]);

    return children;
};

export default AxiosProvider;