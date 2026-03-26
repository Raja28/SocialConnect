// import { supabase } from "../../../lib/supabase";
// import { NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { Database } from "../../../lib/supabase";

// export async function PATCH(request: Request) {
//   const headerList = await headers();
//   const user_id = headerList.get("x-user-id");

//   if (!user_id) {
//     return NextResponse.json(
//       { error: "User context missing" },
//       { status: 401 },
//     );
//   }

//   try {
//     const body = await request.json();

//     type UserTable = Database["public"]["Tables"]["users"];

//     const { data, error } = await supabase
//       .from("users")
//       .update({
//         first_name: body.first_name,
//         last_name: body.last_name,
//         username: body.username,
//         bio: body.bio,
//         avatar_url: body.avatar_url,
//         location: body.location,
//         website: body.website,
//       } as unknown as Database["public"]["Tables"]["users"]["Update"])
//       .eq("id", user_id)
//       .select()
//       // .single();

//     if (error)
//       return NextResponse.json({ error: error.message }, { status: 400 });

//     return NextResponse.json({
//       message: "Profile updated successfully",
//       profile: data,
//     });
//   } catch (err) {
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }


import { supabase } from "../../../lib/supabase";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Database } from "../../../lib/supabase";

type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function PATCH(request: Request) {
  const headerList = await headers();
  const user_id = headerList.get("x-user-id");

  if (!user_id) {
    return NextResponse.json(
      { error: "User context missing" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const updatePayload: UserUpdate = {
      first_name: body.first_name,
      last_name: body.last_name,
      username: body.username,
      bio: body.bio,
      avatar_url: body.avatar_url,
      location: body.location,
      website: body.website,
    };

    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", user_id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}