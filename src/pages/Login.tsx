import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router";

export default function Login() {
  const [searchParams] = useSearchParams();
  const hasSignInError = searchParams.has("error");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSignInError && (
            <p className="mb-4 text-center text-sm text-destructive" role="alert">
              Google sign-in failed. Please try again.
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              window.location.href = "/api/oauth/google";
            }}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
