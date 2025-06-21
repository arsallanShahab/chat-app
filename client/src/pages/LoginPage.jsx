import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Chat App</h1>
          <p className="text-gray-600">Connect and chat in real-time</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
