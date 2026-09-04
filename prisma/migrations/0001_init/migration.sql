-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('highlight', 'partner', 'stat');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('draft', 'visible', 'hidden', 'deleted');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'vi');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'viewed');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('active', 'locked');

-- CreateTable
CREATE TABLE "admin_account" (
    "id" CHAR(26) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" "AdminStatus" NOT NULL DEFAULT 'active',
    "failed_attempts" SMALLINT NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admin_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_block" (
    "id" CHAR(26) NOT NULL,
    "block_type" "BlockType" NOT NULL,
    "status" "BlockStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_by" CHAR(26) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" CHAR(26),
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "content_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_block_i18n" (
    "id" CHAR(26) NOT NULL,
    "block_id" CHAR(26) NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" VARCHAR(120),
    "description" VARCHAR(300),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_block_i18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead" (
    "id" CHAR(26) NOT NULL,
    "contact_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "service_interest" VARCHAR(60) NOT NULL,
    "message" VARCHAR(1000),
    "source" VARCHAR(80) DEFAULT 'landing',
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "email_status" "EmailStatus" NOT NULL DEFAULT 'pending',
    "email_attempts" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewed_at" TIMESTAMPTZ,
    "viewed_by" CHAR(26),

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_consent" (
    "id" CHAR(26) NOT NULL,
    "lead_id" CHAR(26) NOT NULL,
    "given" BOOLEAN NOT NULL,
    "consent_text_version" VARCHAR(20) NOT NULL,
    "consent_text_hash" CHAR(64),
    "given_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(255),

    CONSTRAINT "lead_consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" CHAR(26) NOT NULL,
    "admin_id" CHAR(26),
    "action" VARCHAR(40) NOT NULL,
    "entity_type" VARCHAR(20),
    "entity_id" CHAR(26),
    "result" VARCHAR(10) NOT NULL DEFAULT 'success',
    "ip" VARCHAR(64),
    "at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detail" JSONB DEFAULT '{}',

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_admin_email" ON "admin_account"("email");

-- CreateIndex
CREATE INDEX "idx_cb_type_status_sort" ON "content_block"("block_type", "status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "uq_cbi_block_locale" ON "content_block_i18n"("block_id", "locale");

-- CreateIndex
CREATE INDEX "idx_lead_status_created" ON "lead"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_lead_service" ON "lead"("service_interest");

-- CreateIndex
CREATE INDEX "idx_lead_emailstatus" ON "lead"("email_status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_consent_lead" ON "lead_consent"("lead_id");

-- CreateIndex
CREATE INDEX "idx_audit_admin_at" ON "audit_log"("admin_id", "at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_action" ON "audit_log"("action");

-- AddForeignKey
ALTER TABLE "content_block" ADD CONSTRAINT "content_block_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admin_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_block" ADD CONSTRAINT "content_block_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "admin_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_block_i18n" ADD CONSTRAINT "content_block_i18n_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "content_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_viewed_by_fkey" FOREIGN KEY ("viewed_by") REFERENCES "admin_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_consent" ADD CONSTRAINT "lead_consent_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

