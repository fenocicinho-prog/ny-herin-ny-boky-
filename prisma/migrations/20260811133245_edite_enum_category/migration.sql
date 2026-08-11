-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookCategory" AS ENUM ('BUSINESS_ENTREPRENEURIAT', 'DEVELOPPEMENT_PERSONNEL', 'PSYCHOLOGIE', 'FINANCE_INVESTISSEMENT', 'MARKETING_VENTE', 'COMMUNICATION_LEADERSHIP', 'BOKY_MALAGASY', 'SCIENCE_TECHNOLOGIE', 'ROMANS', 'THRILLER_SUSPENSE', 'AUTRE');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BUY', 'BORROW', 'BOOK');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'MOBILE_MONEY', 'MVOLA', 'ON_SITE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'TWENTY_BOOKS', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "MvolaPaymentStatus" AS ENUM ('EN_ATTENTE_CLIENT', 'EN_ATTENTE_VERIFICATION', 'EN_ATTENTE_MATCH', 'PAYE', 'LIVRE', 'TERMINE', 'ERREUR_REF', 'ORPHELINE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PAYMENT_INITIATED', 'CLIENT_REF_SUBMITTED', 'ADMIN_REF_RECEIVED', 'PAYMENT_VERIFIED', 'PAYMENT_CONFIRMED', 'SELLER_NOTIFIED', 'DELIVERY_CONFIRMED', 'VENDOR_PAID', 'FRAUD_DETECTED');

-- CreateEnum
CREATE TYPE "SellerPlanType" AS ENUM ('COMMISSION', 'ABONNEMENT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plantype" "SellerPlanType" NOT NULL DEFAULT 'COMMISSION',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "mvolaNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "location" TEXT,
    "postalCode" TEXT,
    "reasonForJoining" TEXT,
    "bookTypesSought" TEXT,
    "sellerPlanType" TEXT DEFAULT 'COMMISSION',
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionStatus" "SubscriptionStatus" DEFAULT 'ACTIVE',
    "subscriptionEndsAt" TIMESTAMP(3),
    "stripeSessionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "mvolaNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "buyPrice" DOUBLE PRECISION,
    "rentPrice" DOUBLE PRECISION,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "imageUrl" TEXT,
    "category" "BookCategory" NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryLocation" TEXT,
    "paidToVendor" BOOLEAN NOT NULL DEFAULT false,
    "amount" DOUBLE PRECISION NOT NULL,
    "phoneNumber" TEXT,
    "stripeSessionId" TEXT,
    "mvolaFee" DOUBLE PRECISION,
    "mvolaStatus" TEXT NOT NULL DEFAULT 'EN_ATTENTE_CLIENT',
    "clientTrxRef" TEXT NOT NULL,
    "adminTrxRef" TEXT,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorPaymentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSessionId_key" ON "User"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_clientTrxRef_key" ON "Order"("clientTrxRef");

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
