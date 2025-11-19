import { render, screen } from "@testing-library/react"
import Home from "../page"

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          title: "Test Post",
          content: "Test content",
          published: true,
          deletedAt: null,
          createdAt: new Date(),
          author: {
            id: 1,
            name: "Test Author",
            email: "test@example.com",
          },
        },
      ]),
    },
  },
}))

describe("Home Page", () => {
  it("renders home page", async () => {
    const page = await Home()
    render(page)

    expect(screen.getByText(/RemaBlog/i)).toBeInTheDocument()
  })
})

