import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="text-center py-16">
            <div className="mb-8">
                <h1 className="text-9xl font-bold" style={{ color: 'var(--text-tertiary)' }}>404</h1>
                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Page Not Found
                </h2>
                <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
                    Sorry, the page you are looking for doesn't exist.
                </p>
            </div>

            <div className="space-x-4">
                <Link to="/" className="btn btn-primary font-medium py-2 px-4 rounded-lg transition-colors">
                    Go Home
                </Link>
                <Link to="/auctions" className="btn btn-secondary font-medium py-2 px-4 rounded-lg transition-colors">
                    Browse Auctions
                </Link>
            </div>
        </div>
    );
};

export default NotFound;