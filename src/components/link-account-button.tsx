"use client";

import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { Button } from "./ui/button";

export const LinkAccountButton = () => {
  return (
    <Button
      onClick={async () => {
        const authURL = await getAurinkoAuthUrl("Google");
        window.location.href = authURL;
      }}
    >
      Link Account
    </Button>
  );
};
