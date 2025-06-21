import React from "react";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg">The page you are looking for does not exist.</p>
        <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Go back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
