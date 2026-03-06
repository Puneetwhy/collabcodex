// frontend/src/components/common/GlobalErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global Error Boundary caught:', error, errorInfo);
    // Optional: send to Sentry / other logging service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
          {/* Subtle background accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 bg-destructive/5 rounded-full blur-3xl" />
          </div>

          <div className="relative w-full max-w-lg">
            <Card className="border border-border/60 shadow-xl backdrop-blur bg-background/80">
              <CardHeader className="text-center space-y-6 pt-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                  <AlertTriangle className="h-7 w-7 text-destructive" />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight">
                    Something went wrong
                  </CardTitle>

                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    An unexpected error occurred. You can reload the page or safely return to your dashboard.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pb-10">
                {/* Technical error box */}
                <div className="text-xs sm:text-sm font-mono bg-muted/60 border border-border rounded-xl p-4 max-h-44 overflow-auto text-muted-foreground">
                  {this.state.error?.message || 'Unknown error'}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.location.reload()}
                    className="w-full sm:flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>

                  <Button variant="outline" asChild className="w-full sm:flex-1">
                    <Link to="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-8">
              If the issue persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;