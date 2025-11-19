import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LikeButton from "../LikeButton"

// Mock fetch
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("LikeButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ liked: false, count: 0 }),
    })
  })

  it("renders like button", async () => {
    render(<LikeButton postId={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument()
    })
  })

  it("shows like count", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ liked: true, count: 5 }),
    })

    render(<LikeButton postId={1} />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument()
    })
  })
})

