import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsCharts } from "@/components/metrics/MetricsCharts";

const monthlyData = [
  { month: "jan/25", count: 2 },
  { month: "fev/25", count: 5 },
  { month: "mar/25", count: 0 },
  { month: "abr/25", count: 3 },
  { month: "mai/25", count: 7 },
  { month: "jun/25", count: 1 },
];

const toneData = [
  { tone: "Profissional", count: 8 },
  { tone: "Casual", count: 4 },
];

const providerData = [
  { provider: "anthropic", count: 10 },
  { provider: "groq", count: 3 },
];

const postStatusCounts = { published: 12, scheduled: 3, failed: 1 };

describe("MetricsCharts", () => {
  it("renderiza o gráfico de carrosséis por mês", () => {
    render(<MetricsCharts monthlyData={monthlyData} toneData={toneData} providerData={providerData} postStatusCounts={postStatusCounts} />);
    expect(screen.getByText("Carrosséis por mês")).toBeTruthy();
  });

  it("mostra a distribuição de tons", () => {
    render(<MetricsCharts monthlyData={monthlyData} toneData={toneData} providerData={providerData} postStatusCounts={postStatusCounts} />);
    expect(screen.getByText("Profissional")).toBeTruthy();
    expect(screen.getByText("Casual")).toBeTruthy();
  });

  it("exibe contagem de posts publicados", () => {
    render(<MetricsCharts monthlyData={monthlyData} toneData={toneData} providerData={providerData} postStatusCounts={postStatusCounts} />);
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("exibe mensagem quando não há posts", () => {
    render(<MetricsCharts monthlyData={monthlyData} toneData={[]} providerData={[]} postStatusCounts={{ published: 0, scheduled: 0, failed: 0 }} />);
    expect(screen.getByText("Nenhum carrossel ainda")).toBeTruthy();
    expect(screen.getByText("Nenhum post ainda")).toBeTruthy();
  });
});
