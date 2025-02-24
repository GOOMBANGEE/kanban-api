-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "register_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "logic_delete" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "invite_code" TEXT,
    "icon" TEXT,
    "logic_delete" BOOLEAN NOT NULL DEFAULT false,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "display_order" DOUBLE PRECISION NOT NULL,
    "logic_delete" BOOLEAN NOT NULL DEFAULT false,
    "board_id" BIGINT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "display_order" DOUBLE PRECISION NOT NULL,
    "logic_delete" BOOLEAN NOT NULL DEFAULT false,
    "board_id" BIGINT NOT NULL,
    "group_id" BIGINT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "display_order" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logic_delete" BOOLEAN NOT NULL DEFAULT false,
    "board_id" BIGINT NOT NULL,
    "group_id" BIGINT NOT NULL,
    "status_id" BIGINT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Board_user_id_idx" ON "Board"("user_id");

-- CreateIndex
CREATE INDEX "Group_board_id_idx" ON "Group"("board_id");

-- CreateIndex
CREATE INDEX "Status_board_id_idx" ON "Status"("board_id");

-- CreateIndex
CREATE INDEX "Status_group_id_idx" ON "Status"("group_id");

-- CreateIndex
CREATE INDEX "Ticket_board_id_idx" ON "Ticket"("board_id");

-- CreateIndex
CREATE INDEX "Ticket_group_id_idx" ON "Ticket"("group_id");

-- CreateIndex
CREATE INDEX "Ticket_status_id_idx" ON "Ticket"("status_id");
