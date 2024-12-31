"use client";

import { generateApiKey } from "./actions";
import { GenerateButton } from "./generate-button";

export const GenerateForm = () => {
  return (
    <form action={generateApiKey} className="mt-2">
      <GenerateButton />
    </form>
  );
};
