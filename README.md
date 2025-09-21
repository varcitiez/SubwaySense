# Transit Safety API

The **Transit Safety API** provides station-specific safety analysis for subway stations, powered by AI verification.  
It has evolved from a general-purpose research agent into a targeted tool that delivers **accurate, verified safety reports** for specific stations.

---

## Key Features

1. **Station-Specific Queries**  
   - Accepts a subway station name (e.g., `"Times Square"`) instead of generic search queries.  
   - Produces **focused and relevant safety reports**.

2. **Dual-AI Verification System**  
   - **Cerebras:** Performs initial web searches and generates a preliminary safety report.  
   - **Google Gemini Flash 2.5:** Cross-checks sources and validates Cerebras’s report to produce a **final, verified summary**.

---

## File Breakdown

### `requirements.txt`
- Added `google-genai` to support Gemini API integration.

### `app.py` (Flask Server)
- `/research` endpoint updated to expect a `station` field in the JSON request.  
- Calls the refactored `deeper_research_topic(station)` function.  
- Maintains clean, sorted incident reports for the frontend.

### `agent.py` (Core Logic)
- **Global Gemini Client:** A single reusable client instance improves performance and clarity.  
- **`generate(prompt)`**: Encapsulates all Gemini API calls.  
- **`verify_with_gemini(sources, cerebras_report)`**: Refactored to use `generate`, separating prompt creation from API logic.  
- **.env Loading:** Uses `python-dotenv` with an explicit path for reliable key loading.

---

## Troubleshooting & Fixes

During Gemini API integration, the team encountered:  
`ValueError: Missing key inputs argument!`

### Diagnosis
- Error indicated that `GEMINI_API_KEY` was not being passed correctly to `genai.Client`.

### Incorrect Attempts
- Misuse of `genai.configure()`.  
- Instantiating the client inside `verify_with_gemini`.  
- Manually parsing `.env`.

### Final Solution
1. **Reliable .env Loading**  
   ```python
   load_dotenv(dotenv_path=dotenv_path)
