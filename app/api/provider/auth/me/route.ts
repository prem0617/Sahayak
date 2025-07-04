// @ts-nocheck
// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("providerToken")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ user: decoded }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
