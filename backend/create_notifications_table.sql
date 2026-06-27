-- Run this in your Supabase SQL Editor to create the Notification table manually
-- (This is provided as a fallback since `prisma db push` may conflict with auth.users foreign keys)

-- 1. Create the Enum type
CREATE TYPE "NotificationType" AS ENUM (
  'SUBSCRIPTION', 
  'SECURITY', 
  'BIRTHDAY', 
  'OFFER', 
  'RENEWAL', 
  'APPOINTMENT', 
  'SYSTEM',
  'INVENTORY'
);

-- 2. Create the Notification table
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- 3. Add Foreign Key constraint linking to Salon
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "public"."Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Enable Supabase Realtime for this table
-- This allows the frontend to listen to new inserts instantly
alter publication supabase_realtime add table "public"."Notification";
