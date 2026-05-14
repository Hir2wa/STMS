import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardHome from "./DashboardHome";

// Mock the lucide-react icons so they don't interfere with the DOM
vi.mock("lucide-react", () => ({
  Bell: () => <div data-testid="bell-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Bus: () => <div data-testid="bus-icon" />,
  Map: () => <div data-testid="map-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
}));

// Mock the backend API services to simulate database responses
vi.mock("../../services/studentService", () => ({
  studentService: { getAll: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) }, // 2 students
}));
vi.mock("../../services/busService", () => ({
  busService: { getAll: vi.fn().mockResolvedValue([{ id: 1 }]) }, // 1 bus
}));
vi.mock("../../services/driverService", () => ({
  driverService: {
    getAll: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]),
  }, // 3 drivers
}));
vi.mock("../../services/routeService", () => ({
  routeService: { getAll: vi.fn().mockResolvedValue([]) }, // 0 routes
}));

describe("DashboardHome Component", () => {
  beforeEach(() => {
    // Simulate an authenticated user
    localStorage.setItem("token", "fake-token-for-test");
  });

  it("renders dashboard title and loads stats successfully", async () => {
    render(<DashboardHome />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    // Wait for the mock API calls to resolve and update the UI
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument(); // 2 Total Students
      expect(screen.getByText("1")).toBeInTheDocument(); // 1 Active Bus
      expect(screen.getByText("3")).toBeInTheDocument(); // 3 Total Drivers
    });
  });
});
