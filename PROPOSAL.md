## AI Stylist Chat Optimization Proposal
Right now, our frontend sends the entire chat history with every request. As conversations get longer, this drags down performance and increases token costs.
Let’s fix that by moving all conversation state management to the backend. The frontend should just send the latest user message and a conversation ID. Then, on the backend, we grab the recent messages from the database, build a context window (either the last N messages or by trimming based on token limits) and send that to the AI.
To stay within token limits, we’ll use a rolling window, summarizing older messages as the conversation goes on. That way, important details stick around in a condensed form, and the chat feels continuous without unnecessary bloat.


## OutfiT Recommendation Optimization Proposal
Here’s the lowdown on our Outfit of the Day feature. Every day, our backend scans the outfit_suggestions table and grabs the best outfit for each user. We use our usual tools — CLIP embeddings and the Outfit Transformer — to figure out those picks.

Backend Endpoint
func (h *OutfitHandler) GetOutfitOfTheDay(w http.ResponseWriter, r *http.Request)

What happens here? First, the handler figures out who’s asking. Then it checks if there’s already an outfit for that user today. If yes, it serves that up. If not, it finds the top match or creates a new one, tags it with today’s date, and stashes it for easy caching. Finally, it sends the outfit to the user.

Frontend Hook
export const useOutfitOfTheDay = (): {
  outfit: Outfit | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

This hook runs as soon as the page loads, fetching the outfit while handling loading states, errors, or refreshes.

Edge Cases
If there aren’t enough closet items, we send a fallback message or throw out a few simple outfit ideas. If someone dismisses an outfit, we mark it dismissed and fetch the next best suggestion. And if there’s just nothing new, we stick with the last solid option.

In short, the whole setup builds on what we already have. Caching keeps things quick and avoids wasted work. It does the job without burning extra resources.