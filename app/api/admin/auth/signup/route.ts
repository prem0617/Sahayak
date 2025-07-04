// @ts-nocheck
// app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Invalid email or password" });

    const hashedPasswords = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: { email: email, password: hashedPasswords, role: "ADMIN" },
    });

    // Generate JWT token with admin role
    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json(
      { message: "Signup successful" },
      { status: 200 }
    );
    response.cookies.set("adminToken", token, {
      httpOnly: true, // Prevents JavaScript access to cookies
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// // app/api/admin/dashboard/stats/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   try {
//     const [
//       totalUsers,
//       totalProviders,
//       totalBookings,
//       recentBookings,
//       providers,
//       users
//     ] = await Promise.all([
//       prisma.user.count({ where: { role: "USER" } }),
//       prisma.serviceProvider.count(),
//       prisma.booking.count(),
//       prisma.booking.findMany({
//         take: 5,
//         orderBy: { createdAt: "desc" },
//         include: {
//           user: true,
//           provider: true,
//         },
//       }),
//       prisma.serviceProvider.findMany({
//         take: 5,
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.user.findMany({
//         where: { role: "USER" },
//         take: 5,
//         orderBy: { createdAt: "desc" },
//       }),
//     ]);

//     return NextResponse.json({
//       stats: {
//         totalUsers,
//         totalProviders,
//         totalBookings,
//       },
//       recentData: {
//         recentBookings,
//         recentProviders: providers,
//         recentUsers: users,
//       },
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
