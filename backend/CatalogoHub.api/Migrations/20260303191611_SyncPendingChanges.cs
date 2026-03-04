using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CatalogoHub.api.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "user_favorites");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "user_favorites");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "user_favorites");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "user_favorites");

            migrationBuilder.DropColumn(
                name: "ReleaseDate",
                table: "user_favorites");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "user_favorites",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "user_favorites",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "user_favorites",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "user_favorites",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "user_favorites",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Rating",
                table: "user_favorites",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReleaseDate",
                table: "user_favorites",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
