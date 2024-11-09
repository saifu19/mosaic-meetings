import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4">
                    <Alert variant="destructive">
                        <AlertTitle>Something went wrong</AlertTitle>
                        <AlertDescription>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </AlertDescription>
                    </Alert>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
