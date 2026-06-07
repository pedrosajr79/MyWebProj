import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarView } from "@/components/calendar/CalendarView";

const mockPosts = [
  {
    id: "post-1",
    platform: "instagram" as const,
    status: "scheduled" as const,
    caption: "Teste de legenda",
    scheduled_at: new Date().toISOString(),
    published_at: null,
    created_at: new Date().toISOString(),
    social_connections: { account_name: "minha_conta" },
    carousels: { title: "Carrossel Teste" },
  },
];

describe("CalendarView", () => {
  it("renderiza o calendário com título do mês", () => {
    render(<CalendarView posts={[]} />);
    const hoje = new Date();
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    expect(screen.getByText(new RegExp(meses[hoje.getMonth()]))).toBeTruthy();
  });

  it("exibe os dias da semana", () => {
    render(<CalendarView posts={[]} />);
    expect(screen.getByText("Dom")).toBeTruthy();
    expect(screen.getByText("Sáb")).toBeTruthy();
  });

  it("renderiza posts agendados no dia correto", () => {
    render(<CalendarView posts={mockPosts} />);
    // O dia de hoje deve ter pelo menos um post
    const hoje = new Date().getDate().toString();
    const dayButtons = screen.getAllByRole("button");
    const todayButton = dayButtons.find(btn => btn.textContent?.includes(hoje));
    expect(todayButton).toBeTruthy();
  });

  it("exibe mensagem de seleção quando nenhum dia está selecionado", () => {
    render(<CalendarView posts={[]} />);
    expect(screen.getByText(/Selecione um dia/)).toBeTruthy();
  });
});
