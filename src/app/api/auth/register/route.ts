import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
const isProduction = process.env.NODE_ENV === "production";

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface UserRow {
  id: string | number;
  email: string;
  username: string;
  password_hash: string;
  avatar_url?: string;
}

export async function POST(request: Request) {
  try {
    const { email, password, first_name, last_name, username } =
      await request.json();
    
    if (!email || !password || !first_name ||  !last_name || !username) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email.toLowerCase()},username.eq.${username}`)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newId = randomUUID();

    const { data, error } = (await supabase
      .from("users")
      .insert([
        {
          // id: newId,
          first_name,
          last_name,
          email: email.toLowerCase(),
          username,
          password_hash,
          avatar_url: `https://ui-avatars.com/api/?name=${username}`,
        },
      ])
      .select()
      .single()) as { data: UserRow | null; error: any };

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Email or Username already exists" },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 },
      );
    }

    let token = undefined;

    if (data !== null && data !== undefined) {
      token = jwt.sign(
        { id: data.id, email: data.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );
    }
    delete data.password_hash;
    const user = data;

    const response = NextResponse.json(
      { message: "User registered!", user: data },
      { status: 201 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;

  } catch (err) {
    console.log("err--->", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}



