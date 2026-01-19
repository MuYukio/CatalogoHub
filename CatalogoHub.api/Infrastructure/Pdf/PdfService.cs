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
        public byte[] GenerateFavoritesPdf(FavoritesPdfDto pdfData)
        {
            // Configurar licença
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    // Configurações básicas da página
                    page.Size(PageSizes.A4);
                    page.Margin(1, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // Cabeçalho SIMPLES
                    page.Header()
                        .Column(column =>
                        {
                            column.Item()
                                .Text("📚 CatalogoHub - Lista de Favoritos")
                                .FontSize(16).Bold().FontColor(Colors.Blue.Darken3);

                            column.Item()
                                .Text($"Usuário: {pdfData.UserEmail}")
                                .FontSize(10);

                            column.Item()
                                .Text($"Gerado em: {pdfData.GeneratedAt:dd/MM/yyyy HH:mm}")
                                .FontSize(9).FontColor(Colors.Grey.Medium);
                        });

                    // Conteúdo PRINCIPAL
                    page.Content()
                        .PaddingVertical(0.5f, Unit.Centimetre)
                        .Column(column =>
                        {
                            // Seção de Resumo
                            if (pdfData.Summary.TotalItems > 0)
                            {
                                column.Item()
                                    .Background(Colors.Grey.Lighten4)
                                    .Border(1)
                                    .BorderColor(Colors.Grey.Lighten2)
                                    .Padding(10)
                                    .Column(summaryColumn =>
                                    {
                                        summaryColumn.Item()
                                            .Text("📊 Resumo")
                                            .FontSize(12).Bold();

                                        summaryColumn.Item()
                                            .PaddingTop(5)
                                            .Row(row =>
                                            {
                                                row.RelativeItem()
                                                    .Text($"Total: {pdfData.Summary.TotalItems}")
                                                    .FontColor(Colors.Green.Darken2);

                                                row.RelativeItem()
                                                    .Text($"🎮 Jogos: {pdfData.Summary.GamesCount}")
                                                    .FontColor(Colors.Blue.Medium);

                                                row.RelativeItem()
                                                    .Text($"🎬 Animes: {pdfData.Summary.AnimesCount}")
                                                    .FontColor(Colors.Purple.Medium);
                                            });
                                    });

                                column.Item().Height(10); // Espaço
                            }

                            // Lista de Itens
                            column.Item()
                                .Text("📋 Itens Favoritos")
                                .FontSize(12).Bold();
                                

                            if (pdfData.Items.Any())
                            {
                                // Tabela SIMPLIFICADA
                                column.Item().Table(table =>
                                {
                                    // Configuração SIMPLES de colunas
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.ConstantColumn(25); // #
                                        columns.RelativeColumn(3);  // Título
                                        columns.RelativeColumn(1);  // Tipo
                                        columns.RelativeColumn(1);  // Data
                                    });

                                    // Cabeçalho
                                    table.Header(header =>
                                    {
                                        header.Cell().Text("#").Bold().FontSize(9);
                                        header.Cell().Text("Título").Bold().FontSize(9);
                                        header.Cell().Text("Tipo").Bold().FontSize(9);
                                        header.Cell().Text("Data").Bold().FontSize(9);
                                    });

                                    // Linhas
                                    for (int i = 0; i < pdfData.Items.Count; i++)
                                    {
                                        var item = pdfData.Items[i];
                                        var backgroundColor = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten5;
                                        var typeColor = item.Type == "Game" ? Colors.Blue.Medium : Colors.Purple.Medium;

                                        // Número
                                        table.Cell()
                                            .Background(backgroundColor)
                                            .PaddingVertical(3)
                                            .Text($"{i + 1}")
                                            .FontSize(9);

                                        // Título
                                        table.Cell()
                                            .Background(backgroundColor)
                                            .PaddingVertical(3)
                                            .Text(item.Title)
                                            .FontSize(9);

                                        // Tipo
                                        table.Cell()
                                            .Background(backgroundColor)
                                            .PaddingVertical(3)
                                            .Text(item.Type)
                                            .FontSize(9)
                                            .FontColor(typeColor);

                                        // Data
                                        table.Cell()
                                            .Background(backgroundColor)
                                            .PaddingVertical(3)
                                            .Text(item.AddedDate.ToString("dd/MM/yy"))
                                            .FontSize(9);
                                    }
                                });
                            }
                            else
                            {
                                // Mensagem sem itens
                                column.Item()
                                    .Background(Colors.Yellow.Lighten5)
                                    .Padding(20)
                                    .AlignCenter()
                                    .Text("📭 Nenhum item favoritado ainda!")
                                    .Italic()
                                    .FontColor(Colors.Orange.Darken3);
                            }

                            // Rodapé da seção
                            if (pdfData.Items.Any())
                            {
                                column.Item()
                                    .PaddingTop(10)
                                    .Text($"Total de itens listados: {pdfData.Items.Count}")
                                    .FontSize(9)
                                    .FontColor(Colors.Grey.Darken1);
                            }
                        });

                    // Rodapé da página
                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("Página ").FontSize(8);
                            text.CurrentPageNumber().FontSize(8);
                            text.Span(" de ").FontSize(8);
                            text.TotalPages().FontSize(8);
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}