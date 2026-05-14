import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Sidebar from "./Sidebar";

const mockMenuItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: () => <svg data-testid="dashboard-icon" />,
  },
  {
    label: "Buses",
    path: "/admin/buses",
    icon: () => <svg data-testid="buses-icon" />,
  },
];

describe("Sidebar Component", () => {
  it("renders the brand logo and name correctly", () => {
    render(
      <BrowserRouter>
        <Sidebar menuItems={mockMenuItems} />
      </BrowserRouter>,
    );

    expect(screen.getByText("STMS")).toBeInTheDocument();
    expect(screen.getByText("Main Menu")).toBeInTheDocument();
  });

  it("renders all menu items dynamically", () => {
    render(
      <BrowserRouter>
        <Sidebar menuItems={mockMenuItems} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Buses")).toBeInTheDocument();
  });
});
