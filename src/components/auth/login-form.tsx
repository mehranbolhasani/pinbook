"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/auth";
import { getPinboardAPI } from "@/lib/api/pinboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark01Icon } from "@hugeicons/core-free-icons";
import { fadeInUp } from "@/lib/animations";

export function LoginForm() {
  const [apiToken, setApiToken] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Basic validation
      if (!apiToken.trim() || !username.trim()) {
        throw new Error("Please enter both username and API token");
      }

      // Check token format (should be username:token)
      if (!apiToken.includes(":")) {
        throw new Error("API token should be in format: username:token");
      }

      // Validate API token
      const api = getPinboardAPI(apiToken);
      if (!api) {
        throw new Error("Failed to initialize API client");
      }

      const isValid = await api.validateToken();
      if (!isValid) {
        throw new Error("Invalid API token. Please check your credentials in Pinboard settings.");
      }

      // Store credentials and redirect
      login(apiToken, username);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh w-full h-svh flex items-center justify-center bg-background">
      <div className="w-full max-w-[calc(100vw-2rem)] z-20 h-[calc(100vh-2rem)] flex flex-col sm:flex-row items-stretch justify-between border border-primary">
        <div className="absolute top-4 right-4 z-30">
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-start justify-between p-8 min-h-[70vh] flex-1">
          <motion.div className="text-left" initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="flex items-center justify-start gap-1">
              <HugeiconsIcon icon={Bookmark01Icon} size={24} className="text-primary" />
              <h2 className="text-xl text-primary font-medium tracking-tighter">Pinbook</h2>
            </div>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-sm tracking-tight">Enter your Pinboard API credentials to get started</p>
          </motion.div>
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4 w-full max-w-sm"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your Pinboard username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setError("")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your Pinboard API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                onFocus={() => setError("")}
                required
              />
              <p className="text-xs text-muted-foreground">
                You can find your API token in your Pinboard settings.
                <br />
                Format: <code className="bg-muted px-1 rounded">username:token</code>
              </p>
            </div>

            {error && (
              <motion.div
                className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-fit mx-auto px-4" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </motion.form>

          <motion.div className="text-left" initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.2 }}>
            <p className="text-sm text-muted-foreground flex flex-col items-start justify-center">
              <span>Don&apos;t have a Pinboard account? </span>
              <a href="https://pinboard.in/signup/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Sign up for Pinboard
              </a>
            </p>
          </motion.div>

        </div>

        <div className="pattern w-full h-full bg-[url(/pattern-one.svg)] sm:border-l border-primary flex-1"></div>


      </div>
    </div>
  );
}
