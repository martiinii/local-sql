CREATE TABLE `access_token` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`allowWrite` integer
);
--> statement-breakpoint
CREATE TABLE `connection` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`uri` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `server` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`token` text
);
