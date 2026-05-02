"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, UserRound } from "lucide-react";

type MemberProfile = {
  id: string;
  profileImage: string | null;
  user: {
    name: string;
    email: string;
  };
};

export default function CustomerAuthCorner() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadLoggedMember() {
    const savedMemberId = localStorage.getItem("dolphin_member_id");
    const savedMemberName = localStorage.getItem("dolphin_member_name");

    if (!savedMemberId) {
      setMemberId(null);
      setMemberName(null);
      setProfileImage(null);
      setLoading(false);
      return;
    }

    setMemberId(savedMemberId);
    setMemberName(savedMemberName || "My Profile");

    try {
      const res = await fetch(`/api/member/profile?memberId=${savedMemberId}`);
      const data: MemberProfile = await res.json();

      if (res.ok) {
        setMemberName(data.user.name);
        setProfileImage(data.profileImage);
        localStorage.setItem("dolphin_member_name", data.user.name);
      }
    } catch (error) {
      console.error("CUSTOMER_AUTH_LOAD_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoggedMember();

    function handleFocus() {
      loadLoggedMember();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="hidden h-10 w-28 rounded-full bg-white/10 md:block" />
    );
  }

  if (!memberId) {
    return (
      <div className="hidden items-center gap-3 md:flex">
        <Link href="/login" className="transition hover:text-white">
          Login
        </Link>

        <Link
          href="/register"
          className="shine-effect rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition duration-300 hover:scale-105 hover:bg-zinc-200"
        >
          Join Now
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/my-profile"
      className="group hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-black text-white transition hover:scale-105 hover:bg-white/10 md:flex"
    >
      <div className="h-9 w-9 overflow-hidden rounded-full bg-white text-black">
        {profileImage ? (
          <img
            src={profileImage}
            alt={memberName || "Profile"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound size={18} />
          </div>
        )}
      </div>

      <span className="max-w-[130px] truncate">{memberName}</span>
    </Link>
  );
}