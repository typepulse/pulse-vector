"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@headlessui/react";
import { useState } from "react";

export default function JointlistForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to join waitlist";
        try {
          const data = await response.json();
          errorMessage = data.error ?? errorMessage;
        } catch (err) {
          console.error(err);
        }

        throw new Error(errorMessage);
      }

      setEmail("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center flex-col md:flex-row gap-4 w-full md:w-auto"
      >
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="block w-full rounded-md bg-white px-4 py-2 text-lg text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          required
        />
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Joining..." : "Join the waitlist"}
        </Button>
      </form>
      {error && (
        <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>
      )}
      {success && (
        <p className="mt-2 text-sm text-green-500 font-semibold">
          Successfully joined the waitlist!
        </p>
      )}
    </div>
  );
}
