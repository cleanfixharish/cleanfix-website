import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, LogIn } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
}) => {
  const { user, loading, isAdmin, login } = useAuth();
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // If the user is not logged in, redirect to the login page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2EDE5] p-4">
        <Card className="w-full max-w-md border-[#D8D0C6] bg-[#FBF8F3]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DDE9E7]">
              <Shield className="h-8 w-8 text-[#174E57]" />
            </div>
            <CardTitle className="text-xl text-[#173F46]">CleanFixHarish owner access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <p className="text-sm text-[#756D64]">Sign in with the approved administrator account to open the protected manager dashboard.</p>
            <Button onClick={login} className="w-full bg-[#174E57] hover:bg-[#103A41]">
              <LogIn className="mr-2 h-4 w-4" />Secure admin sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If the user is not an admin, show an insufficient-permissions page
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Insufficient Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-gray-600">
              <p className="mb-2">
                The account you are using does not have administrator rights.
              </p>
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    Current account: {user.email}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Role: {user.role === 'user' ? 'Regular user' : user.role}
                </div>
              </div>
              <p className="text-sm">
                Please log in with an account that has administrator rights.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={login} className="w-full" variant="outline">
                <LogIn className="h-4 w-4 mr-2" />
                Switch account
              </Button>

              <Button
                onClick={() => window.history.back()}
                className="w-full"
                variant="ghost"
              >
                Go back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If the user is an admin, render the child components
  return <>{children}</>;
};

export default ProtectedAdminRoute;
