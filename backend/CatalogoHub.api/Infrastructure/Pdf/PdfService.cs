using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using CatalogoHub.api.Domain.DTOs;

namespace CatalogoHub.api.Infrastructure.Pdf
{
    public interface IPdfService
    {
        byte[] GenerateFavoritesPdf(FavoritesPdfDto pdfData);
    }

    public class PdfService : IPdfService
    {
        private static readonly string ColorBg = "#0f1117";
        private static readonly string ColorSurface = "#1a1d2e";
        private static readonly string ColorSurfaceAlt = "#141622";
        private static readonly string ColorAccentBlue = "#4f8ef7";
        private static readonly string ColorAccentPurple = "#a855f7";
        private static readonly string ColorAccentGreen = "#22c55e";
        private static readonly string ColorBorder = "#2a2d3e";
        private static readonly string ColorTextPrimary = "#f1f5f9";
        private static readonly string ColorTextMuted = "#64748b";
        private static readonly string ColorTextSub = "#94a3b8";
        private static readonly string ColorGameBadge = "#1e3a5f";
        private static readonly string ColorAnimeBadge = "#2d1b4e";

        public byte[] GenerateFavoritesPdf(FavoritesPdfDto pdfData)
        {
            var gamesCount = pdfData.Summary.GamesCount;
            var animesCount = pdfData.Summary.AnimesCount;
            var totalCount = pdfData.Summary.TotalItems;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(0);
                    page.PageColor(ColorBg);
                    page.DefaultTextStyle(x => x
                        .FontFamily("Arial")
                        .FontColor(ColorTextPrimary)
                        .FontSize(10));

                    // ── Header ────────────────────────────────────────────────
                    page.Header().Element(BuildHeader(pdfData));

                    // ── Content ───────────────────────────────────────────────
                    page.Content()
                        .PaddingHorizontal(28)
                        .PaddingBottom(20)
                        .Column(col =>
                        {
                            // Stats cards
                            col.Item().PaddingBottom(20).Element(BuildStatsRow(totalCount, gamesCount, animesCount));

                            // Section title
                            col.Item().PaddingBottom(12).Row(row =>
                            {
                                row.AutoItem()
                                    .Background(ColorAccentBlue)
                                    .Width(3)
                                    .Height(18);

                                row.AutoItem().Width(10);

                                row.RelativeItem()
                                    .AlignMiddle()
                                    .Text("Lista de Favoritos")
                                    .FontSize(13)
                                    .Bold()
                                    .FontColor(ColorTextPrimary);
                            });

                            // Items
                            if (pdfData.Items.Any())
                            {
                                for (int i = 0; i < pdfData.Items.Count; i++)
                                {
                                    var item = pdfData.Items[i];
                                    var isGame = item.Type == "Game";
                                    var isEven = i % 2 == 0;

                                    col.Item()
                                        .PaddingBottom(4)
                                        .Element(BuildItemRow(item, i + 1, isGame, isEven));
                                }

                                // Footer count
                                col.Item().PaddingTop(16).Row(row =>
                                {
                                    row.RelativeItem()
                                        .BorderTop(1)
                                        .BorderColor(ColorBorder)
                                        .PaddingTop(10)
                                        .Text($"{totalCount} {(totalCount == 1 ? "item" : "itens")} no total")
                                        .FontSize(9)
                                        .FontColor(ColorTextMuted);
                                });
                            }
                            else
                            {
                                col.Item()
                                    .Background(ColorSurface)
                                    .Border(1)
                                    .BorderColor(ColorBorder)
                                    .Padding(32)
                                    .AlignCenter()
                                    .Text("Nenhum item favoritado ainda.")
                                    .Italic()
                                    .FontColor(ColorTextMuted);
                            }
                        });

                    // ── Footer ────────────────────────────────────────────────
                    page.Footer().Element(BuildFooter(pdfData));
                });
            });

            return document.GeneratePdf();
        }

        // ── Builders ──────────────────────────────────────────────────────────

        private Action<IContainer> BuildHeader(FavoritesPdfDto pdfData) => container =>
        {
            container
                .Background(ColorSurface)
                .BorderBottom(1)
                .BorderColor(ColorAccentBlue)
                .PaddingHorizontal(28)
                .PaddingVertical(20)
                .Row(row =>
                {
                    // Logo + título
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Row(r =>
                        {
                            r.AutoItem()
                                .Background(ColorAccentBlue)
                                .Width(4)
                                .Height(24);

                            r.AutoItem().Width(10);

                            r.RelativeItem().AlignMiddle().Column(c =>
                            {
                                c.Item()
                                    .Text("CatalogoHub")
                                    .FontSize(20)
                                    .Bold()
                                    .FontColor(ColorTextPrimary);

                                c.Item()
                                    .Text("Lista de Favoritos")
                                    .FontSize(10)
                                    .FontColor(ColorAccentBlue);
                            });
                        });

                        col.Item().PaddingTop(10).Text(pdfData.UserEmail)
                            .FontSize(9)
                            .FontColor(ColorTextMuted);
                    });

                    // Data geração
                    row.AutoItem().AlignRight().AlignBottom().Column(col =>
                    {
                        col.Item()
                            .Text("Gerado em")
                            .FontSize(8)
                            .FontColor(ColorTextMuted)
                            .AlignRight();

                        col.Item()
                            .Text(pdfData.GeneratedAt.ToString("dd/MM/yyyy · HH:mm"))
                            .FontSize(9)
                            .FontColor(ColorTextSub)
                            .AlignRight();
                    });
                });
        };

        private Action<IContainer> BuildStatsRow(int total, int games, int animes) => container =>
        {
            container.Row(row =>
            {
                row.RelativeItem().Element(StatCard("Total", total.ToString(), ColorAccentGreen, "itens favoritados"));
                row.ConstantItem(10);
                row.RelativeItem().Element(StatCard("Jogos", games.ToString(), ColorAccentBlue, "na sua lista"));
                row.ConstantItem(10);
                row.RelativeItem().Element(StatCard("Animes", animes.ToString(), ColorAccentPurple, "na sua lista"));
            });
        };

        private Action<IContainer> StatCard(string label, string value, string accentColor, string sub) => c =>
        {
            c.Background(ColorSurface)
             .Border(1)
             .BorderColor(ColorBorder)
             .BorderTop(2)
             .BorderColor(accentColor)
             .Padding(12)
             .Column(col =>
             {
                 col.Item().Text(label).FontSize(8).FontColor(ColorTextMuted);
                 col.Item().PaddingTop(2).Text(value).FontSize(22).Bold().FontColor(accentColor);
                 col.Item().Text(sub).FontSize(7).FontColor(ColorTextMuted);
             });
        };

        private Action<IContainer> BuildItemRow(FavoritePdfItemDto item, int index, bool isGame, bool isEven) => container =>
        {
            var bgColor = isEven ? ColorSurfaceAlt : ColorSurface;
            var badgeBg = isGame ? ColorGameBadge : ColorAnimeBadge;
            var badgeColor = isGame ? ColorAccentBlue : ColorAccentPurple;
            var typeLabel = isGame ? "JOGO" : "ANIME";

            container
                .Background(bgColor)
                .Border(1)
                .BorderColor(ColorBorder)
                .PaddingHorizontal(14)
                .PaddingVertical(8)
                .Row(row =>
                {
                    // Número
                    row.ConstantItem(28)
                        .AlignMiddle()
                        .Text($"{index:D2}")
                        .FontSize(9)
                        .FontColor(ColorTextMuted);

                    // Barra lateral colorida
                    row.ConstantItem(3)
                        .Background(badgeColor)
                        .AlignMiddle()
                        .Height(20);

                    row.ConstantItem(10);

                    // Título
                    row.RelativeItem()
                        .AlignMiddle()
                        .Text(item.Title)
                        .FontSize(10)
                        .FontColor(ColorTextPrimary);

                    // Badge tipo
                    row.ConstantItem(54)
                        .AlignMiddle()
                        .Background(badgeBg)
                        .Border(1)
                        .BorderColor(badgeColor)
                        .Padding(3)
                        .AlignCenter()
                        .Text(typeLabel)
                        .FontSize(7)
                        .Bold()
                        .FontColor(badgeColor);

                    row.ConstantItem(10);

                    // Data
                    row.ConstantItem(52)
                        .AlignMiddle()
                        .AlignRight()
                        .Text(item.AddedDate.ToString("dd/MM/yy"))
                        .FontSize(8)
                        .FontColor(ColorTextMuted);
                });
        };

        private Action<IContainer> BuildFooter(FavoritesPdfDto pdfData) => container =>
        {
            container
                .Background(ColorSurfaceAlt)
                .BorderTop(1)
                .BorderColor(ColorBorder)
                .PaddingHorizontal(28)
                .PaddingVertical(10)
                .Row(row =>
                {
                    row.RelativeItem()
                        .AlignMiddle()
                        .Text("catalogohub.vercel.app")
                        .FontSize(8)
                        .FontColor(ColorTextMuted);

                    row.AutoItem().AlignRight().Text(text =>
                    {
                        text.Span("Página ").FontSize(8).FontColor(ColorTextMuted);
                        text.CurrentPageNumber().FontSize(8).FontColor(ColorTextSub);
                        text.Span(" / ").FontSize(8).FontColor(ColorTextMuted);
                        text.TotalPages().FontSize(8).FontColor(ColorTextSub);
                    });
                });
        };
    }
}