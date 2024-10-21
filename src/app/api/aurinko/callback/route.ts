// /api/aurinko/callback

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (!status)
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 400 },
    );

  //get the code to exchange for the access token
  const code = params.get("code");
  if (!code)
    return NextResponse.json({ message: "No code provided" }, { status: 400 });

  const token = await exchangeCodeForAccessToken(code);
  if (!token)
    return NextResponse.json(
      { message: "Failed to exchange the code for token" },
      { status: 400 },
    );

  // get account details using the token
  const accountDetails = await getAccountDetails(token.accessToken);

  await db.account.upsert({
    where: {
      id: token.accountId.toString(),
    },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId.toString(),
      userId,
      emailAddress: accountDetails?.email as string,
      name: accountDetails?.name as string,
      accessToken: token.accessToken,
    },
  });

  return NextResponse.redirect(new URL("/mail", req.url));
};
