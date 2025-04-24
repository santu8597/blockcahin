"use client"; // Required for hooks like useState

import * as React from "react";
import { Mail, Lock } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    // --- TODO: Add your actual signup logic here ---
    console.log("Signup submitted:", { email });
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Simulated signup complete.");
    // --- End of TODO ---
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-sm"> {/* Card remains white/default */}
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {/* Email Field with Icon */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                className="pl-8" // Padding left for icon
              />
            </div>
          </div>
          {/* Password Field with Icon */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                className="pl-8" // Padding left for icon
              />
            </div>
          </div>
          {/* Confirm Password Field with Icon */}
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                className="pl-8" // Padding left for icon
              />
            </div>
          </div>
           {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          {/* Updated Button with Purple Theme */}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white" // Added purple background and white text
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Optional: Export as default if it's the main export of the file
// export default SignUpForm;

