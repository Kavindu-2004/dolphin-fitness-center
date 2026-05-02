import { prisma } from "@/lib/prisma";
import AdminSidebarClient from "@/components/AdminSidebarClient";
import {
  BarChart3,
  BellRing,
  BookOpen,
  Crown,
  Dumbbell,
  Film,
  Home,
  Megaphone,
  MessageCircle,
  Settings,
  UserRoundCog,
  Users,
  WalletCards,
} from "lucide-react";

export const dynamic = "force-dynamic";

const menuItems = [
  { name: "Command Center", href: "/admin", iconName: "Home" },
  { name: "Members", href: "/admin/members", iconName: "Users" },
  { name: "Payments", href: "/admin/payments", iconName: "WalletCards" },
  { name: "Membership Plans", href: "/admin/membership-plans", iconName: "Crown" },
  { name: "Coaches", href: "/admin/coaches", iconName: "Dumbbell" },
  { name: "Body Profiles", href: "/admin/body-profiles", iconName: "UserRoundCog" },
  { name: "Reminders", href: "/admin/reminders", iconName: "BellRing" },
  { name: "Announcements", href: "/admin/announcements", iconName: "Megaphone" },
  { name: "Website Videos", href: "/admin/site-videos", iconName: "Film" },
  { name: "Blogs", href: "/admin/blogs", iconName: "BookOpen" },
  { name: "Feedbacks", href: "/admin/feedbacks", iconName: "MessageCircle" },
  { name: "Reports", href: "/admin/reports", iconName: "BarChart3" },
  { name: "Settings", href: "/admin/settings", iconName: "Settings" },
];

async function getAdminBrandSettings() {
  const settings = await prisma.systemSetting.findFirst();

  return {
    gymName: settings?.gymName || "Dolphin Fitness Center",
    logoUrl: settings?.logoUrl || null,
    currency: settings?.currency || "LKR",
    monthlyFee: settings?.monthlyFee || 3500,
    personalTrainingFee: settings?.personalTrainingFee || 15000,
  };
}

export default async function AdminSidebar() {
  const brand = await getAdminBrandSettings();

  return <AdminSidebarClient brand={brand} menuItems={menuItems} />;
}